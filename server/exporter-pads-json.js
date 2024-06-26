import 'dotenv/config'
import path from 'path'
import fs from 'fs-extra'
import redis from 'redis'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'
let db
let db_port = 6379
if (process.env.DB_PORT) {
	db_port = process.env.DB_PORT
}
if (process.env.NODE_ENV === 'production') {
	db = redis.createClient({ host: process.env.DB_HOST, port: db_port, password: process.env.DB_PWD })
} else {
	db = redis.createClient({ port: db_port })
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

exporterPadsJson(10)

function exporterPadsJson (jours) {
	db.get('pad', function (err, pad) {
		for (let i = 0; i < pad + 1; i++) {
			const id = i
			const chemin = path.join(__dirname, '..', '/static/pads')
			db.exists('pads:' + id, function (err, resultat) {
				if (resultat === 1) {
					db.hgetall('pads:' + id, function (err, donnees) {
						if ((donnees.hasOwnProperty('modifie') && dayjs(new Date(donnees.modifie)).isBefore(dayjs().subtract(jours, 'days'))) || (donnees.hasOwnProperty('date') && dayjs(new Date(donnees.date)).isBefore(dayjs().subtract(jours, 'days')))) {
							const donneesPad = new Promise(function (resolveMain) {
								db.hgetall('pads:' + id, function (err, resultats) {
									if (err) { resolveMain({}); return false }
									resolveMain(resultats)
								})
							})
							const blocsPad = new Promise(function (resolveMain) {
								const donneesBlocs = []
								db.zrange('blocs:' + id, 0, -1, function (err, blocs) {
									if (err) { resolveMain(donneesBlocs); return false }
									for (const bloc of blocs) {
										const donneesBloc = new Promise(function (resolve) {
											db.hgetall('pad-' + id + ':' + bloc, function (err, donnees) {
												if (err) { resolve({}); return false }
												if (donnees && Object.keys(donnees).length > 0) {
													const donneesCommentaires = []
													db.zrange('commentaires:' + bloc, 0, -1, function (err, commentaires) {
														if (err) { resolve(donnees); return false }
														for (let commentaire of commentaires) {
															donneesCommentaires.push(JSON.parse(commentaire))
														}
														donnees.commentaires = donneesCommentaires.length
														donnees.listeCommentaires = donneesCommentaires
														db.zrange('evaluations:' + bloc, 0, -1, function (err, evaluations) {
															if (err) { resolve(donnees); return false }
															const donneesEvaluations = []
															evaluations.forEach(function (evaluation) {
																donneesEvaluations.push(JSON.parse(evaluation))
															})
															donnees.evaluations = donneesEvaluations.length
															donnees.listeEvaluations = donneesEvaluations
															resolve(donnees)
														})
													})
												} else {
													resolve({})
												}
											})
										})
										donneesBlocs.push(donneesBloc)
									}
									Promise.all(donneesBlocs).then(function (resultat) {
										resolveMain(resultat)
									})
								})
							})
							const activitePad = new Promise(function (resolveMain) {
								const donneesEntrees = []
								db.zrange('activite:' + id, 0, -1, function (err, entrees) {
									if (err) { resolveMain(donneesEntrees); return false }
									for (let entree of entrees) {
										entree = JSON.parse(entree)
										const donneesEntree = new Promise(function (resolve) {
											db.exists('utilisateurs:' + entree.identifiant, function (err) {
												if (err) { resolve({}); return false }
												resolve(entree)
											})
										})
										donneesEntrees.push(donneesEntree)
									}
									Promise.all(donneesEntrees).then(function (resultat) {
										resolveMain(resultat)
									})
								})
							})
							Promise.all([donneesPad, blocsPad, activitePad]).then(function (donnees) {
								if (donnees.length > 0 && donnees[0].id) {
									const parametres = {}
									parametres.pad = donnees[0]
									parametres.blocs = donnees[1]
									parametres.activite = donnees[2]
									fs.writeFile(path.normalize(chemin + '/' + id + '.json'), JSON.stringify(parametres, '', 4), 'utf8', function (err) {
										fs.writeFile(path.normalize(chemin + '/pad-' + id + '.json'), JSON.stringify(parametres.pad, '', 4), 'utf8', function () {
											// Suppression données redis
											db.zrange('blocs:' + id, 0, -1, function (err, blocs) {
												const multi = db.multi()
												for (let i = 0; i < blocs.length; i++) {
													multi.del('commentaires:' + blocs[i])
													multi.del('evaluations:' + blocs[i])
													multi.del('pad-' + id + ':' + blocs[i])
												}
												multi.del('blocs:' + id)
												multi.del('pads:' + id)
												multi.del('activite:' + id)
												multi.exec(function () {
													console.log(id)
												})
											})
										})
									})
								}
							})
						}
					})
				}
			})
		}
	})
}
