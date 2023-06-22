/*!
 * vue-masonry-css v1.0.3
 * https://github.com/paulcollett/vue-masonry-css
 * Released under the MIT License.
 */

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):t.VueMasonry=e()}(this,function(){"use strict";var t=function(t,e){if(parseInt(t)>-1)return t;if("object"!=typeof t)return 0;var n=1/0,i=t.default||0;for(var r in t){var o=parseInt(r),s=t[o],u=parseInt(s);isNaN(o)||isNaN(u)||e<=o&&o<n&&(n=o,i=s)}return i},e={props:{tag:{type:[String],default:"div"},cols:{type:[Object,Number,String],default:2},gutter:{type:[Object,Number,String],default:0},css:{type:[Boolean],default:!0},columnTag:{type:[String],default:"div"},columnClass:{type:[String,Array,Object],default:function(){return[]}},columnAttr:{type:[Object],default:function(){return{}}}},data:function(){return{displayColumns:2,displayGutter:0}},mounted:function(){var t=this;this.$nextTick(function(){t.reCalculate()}),window&&window.addEventListener("resize",this.reCalculate)},updated:function(){var t=this;this.$nextTick(function(){t.reCalculate()})},beforeDestroy:function(){window&&window.removeEventListener("resize",this.reCalculate)},methods:{reCalculate:function(){var t=this.windowWidth;this.windowWidth=(window?window.innerWidth:null)||1/0,t!==this.windowWidth&&(this._reCalculateColumnCount(this.windowWidth),this._reCalculateGutterSize(this.windowWidth))},_reCalculateGutterSize:function(e){this.displayGutter=t(this.gutter,e)},_reCalculateColumnCount:function(e){var n=t(this.cols,e);n=Math.max(1,Number(n)||0),this.displayColumns=n},_getChildItemsInColumnsArray:function(){var t=this,e=[],n=this.$slots.default||[];1===n.length&&n[0].componentOptions&&"transition-group"==n[0].componentOptions.tag&&(n=n[0].componentOptions.children);for(var i=0,r=0;i<n.length;i++,r++)if(n[i].tag){var o=r%t.displayColumns;e[o]||(e[o]=[]),e[o].push(n[i])}else r--;return e}},render:function(t){var e=this,n=this._getChildItemsInColumnsArray(),i=parseInt(this.displayGutter)===1*this.displayGutter?this.displayGutter+"px":this.displayGutter,r={boxSizing:"border-box",backgroundClip:"padding-box",width:100/this.displayColumns+"%",border:"0 solid transparent",borderLeftWidth:i},o=n.map(function(i,o){return t(e.columnTag,{key:o+"-"+n.length,style:e.css?r:null,class:e.columnClass,attrs:e.columnAttr},i)}),s={display:["-webkit-box","-ms-flexbox","flex"],marginLeft:"-"+i};return t(this.tag,this.css?{style:s}:null,o)}},n=function(){};return n.install=function(t,i){n.installed||(i&&i.name?t.component(i.name,e):t.component("masonry",e))},"undefined"!=typeof window&&window.Vue&&window.Vue.use(n),n});