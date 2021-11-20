/*
 * ## INCEpTION ##
 * Licensed to the Technische Universität Darmstadt under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The Technische Universität Darmstadt 
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.
 *  
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * ## brat ##
 * Copyright (C) 2010-2012 The brat contributors, all rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import type { Dispatcher as DispatcherType } from "../dispatcher/Dispatcher";
declare class Dispatcher extends DispatcherType { };

import type { Visualizer as VisualizerType } from "../visualizer/Visualizer";
declare class Visualizer extends VisualizerType { };

import type { VisualizerUI as VisualizerUIType } from "../visualizer_ui/VisualizerUI";
declare class VisualizerUI extends VisualizerUIType { };

export class Util {
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  cmp(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  cmpArrayOnFirstElement(a, b) {
    a = a[0];
    b = b[0];
    return a < b ? -1 : a > b ? 1 : 0;
  }

  unitAgo(n, unit) {
    if (n == 1) return "" + n + " " + unit + " ago";
    return "" + n + " " + unit + "s ago";
  };

  formatTimeAgo(time) {
    if (time == -1000) {
      return "never"; // FIXME make the server return the server time!
    }

    var nowDate = new Date();
    var now = nowDate.getTime();
    var diff = Math.floor((now - time) / 1000);
    if (!diff) return "just now";
    if (diff < 60) return this.unitAgo(diff, "second");
    diff = Math.floor(diff / 60);
    if (diff < 60) return this.unitAgo(diff, "minute");
    diff = Math.floor(diff / 60);
    if (diff < 24) return this.unitAgo(diff, "hour");
    diff = Math.floor(diff / 24);
    if (diff < 7) return this.unitAgo(diff, "day");
    if (diff < 28) return this.unitAgo(Math.floor(diff / 7), "week");
    var thenDate = new Date(time);
    var result = thenDate.getDate() + ' ' + this.monthNames[thenDate.getMonth()];
    if (thenDate.getFullYear() != nowDate.getFullYear()) {
      result += ' ' + thenDate.getFullYear();
    }
    return result;
  }

  realBBox(span) {
    var box = span.rect.getBBox();
    var chunkTranslation = span.chunk.translation;
    var rowTranslation = span.chunk.row.translation;
    box.x += chunkTranslation.x + rowTranslation.x;
    box.y += chunkTranslation.y + rowTranslation.y;
    return box;
  }

  escapeHTML(str) {
    // WEBANNO EXTENSION BEGIN - No issue - More robust escaping 
    if (str === null) {
      return null;
    }
    // WEBANNO EXTENSION END - No issue - More robust escaping 

    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  escapeHTMLandQuotes(str) {
    // WEBANNO EXTENSION BEGIN - No issue - More robust escaping 
    if (str === null) {
      return null;
    }
    // WEBANNO EXTENSION END - No issue - More robust escaping 

    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
  }

  escapeHTMLwithNewlines(str) {
    // WEBANNO EXTENSION BEGIN - No issue - More robust escaping 
    if (str === null) {
      return null;
    }
    // WEBANNO EXTENSION END - No issue - More robust escaping 

    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
  }

  escapeQuotes(str) {
    // WEBANNO EXTENSION BEGIN - No issue - More robust escaping 
    if (str === null) {
      return null;
    }
    // WEBANNO EXTENSION END - No issue - More robust escaping 

    // we only use double quotes for HTML attributes
    return str.replace(/\"/g, '&quot;');
  }

  getSpanLabels(spanTypes, spanType) {
    var type = spanTypes[spanType];
    return type && type.labels || [];
  }

  spanDisplayForm(spanTypes, spanType) {
    var labels = this.getSpanLabels(spanTypes, spanType);
    if (labels[0]) {
      return labels[0];
    }

    var sep = spanType.indexOf('_');
    if (sep >= 0) {
      return spanType.substring(sep + 1)
    }

    return spanType;
  }

  getArcLabels(spanTypes, spanType, arcType, relationTypesHash) {
    var type = spanTypes[spanType];
    var arcTypes = type && type.arcs || [];
    var arcDesc = null;
    // also consider matches without suffix number, if any
    var noNumArcType;
    if (arcType) {
      var splitType = arcType.match(/^(.*?)(\d*)$/);
      noNumArcType = splitType[1];
    }
    $.each(arcTypes, (arcno, arcDescI) => {
      if (arcDescI.type == arcType || arcDescI.type == noNumArcType) {
        arcDesc = arcDescI;
        return false;
      }
    });
    // fall back to relation types for unconfigured or missing def
    if (!arcDesc) {
      arcDesc = $.extend({}, relationTypesHash[arcType] || relationTypesHash[noNumArcType]);
    }
    // WEBANNO EXTENSION BEGIN - #709 - Optimize render data size for annotations without labels
    /*
          return arcDesc && arcDesc.labels || [];
    */
    return arcDesc && $.map(arcDesc.labels, label => '(' + label + ')') || [];
    // WEBANNO EXTENSION END - #709 - Optimize render data size for annotations without labels
  }

  arcDisplayForm(spanTypes, spanType, arcType, relationTypesHash) {
    var labels = this.getArcLabels(spanTypes, spanType, arcType, relationTypesHash);
    return labels[0] || arcType;
  }

  // TODO: switching to use of $.param(), this function should
  // be deprecated and removed.
  objectToUrlStr(o) {
    let a = [];
    $.each(o, (key, value) => {
      a.push(key + "=" + encodeURIComponent(value));
    });
    return a.join("&");
  }

  // color name RGB list, converted from
  // http://www.w3schools.com/html/html_colornames.asp
  // with perl as
  //     perl -e 'print "var colors = {\n"; while(<>) { /(\S+)\s+\#([0-9a-z]{2})([0-9a-z]{2})([0-9a-z]{2})\s*/i or die "Failed to parse $_"; ($r,$g,$b)=(hex($2),hex($3),hex($4)); print "    '\''",lc($1),"'\'':\[$r,$g,$b\],\n" } print "};\n" '
  colors = {
    'aliceblue': [240, 248, 255],
    'antiquewhite': [250, 235, 215],
    'aqua': [0, 255, 255],
    'aquamarine': [127, 255, 212],
    'azure': [240, 255, 255],
    'beige': [245, 245, 220],
    'bisque': [255, 228, 196],
    'black': [0, 0, 0],
    'blanchedalmond': [255, 235, 205],
    'blue': [0, 0, 255],
    'blueviolet': [138, 43, 226],
    'brown': [165, 42, 42],
    'burlywood': [222, 184, 135],
    'cadetblue': [95, 158, 160],
    'chartreuse': [127, 255, 0],
    'chocolate': [210, 105, 30],
    'coral': [255, 127, 80],
    'cornflowerblue': [100, 149, 237],
    'cornsilk': [255, 248, 220],
    'crimson': [220, 20, 60],
    'cyan': [0, 255, 255],
    'darkblue': [0, 0, 139],
    'darkcyan': [0, 139, 139],
    'darkgoldenrod': [184, 134, 11],
    'darkgray': [169, 169, 169],
    'darkgrey': [169, 169, 169],
    'darkgreen': [0, 100, 0],
    'darkkhaki': [189, 183, 107],
    'darkmagenta': [139, 0, 139],
    'darkolivegreen': [85, 107, 47],
    'darkorange': [255, 140, 0],
    'darkorchid': [153, 50, 204],
    'darkred': [139, 0, 0],
    'darksalmon': [233, 150, 122],
    'darkseagreen': [143, 188, 143],
    'darkslateblue': [72, 61, 139],
    'darkslategray': [47, 79, 79],
    'darkslategrey': [47, 79, 79],
    'darkturquoise': [0, 206, 209],
    'darkviolet': [148, 0, 211],
    'deeppink': [255, 20, 147],
    'deepskyblue': [0, 191, 255],
    'dimgray': [105, 105, 105],
    'dimgrey': [105, 105, 105],
    'dodgerblue': [30, 144, 255],
    'firebrick': [178, 34, 34],
    'floralwhite': [255, 250, 240],
    'forestgreen': [34, 139, 34],
    'fuchsia': [255, 0, 255],
    'gainsboro': [220, 220, 220],
    'ghostwhite': [248, 248, 255],
    'gold': [255, 215, 0],
    'goldenrod': [218, 165, 32],
    'gray': [128, 128, 128],
    'grey': [128, 128, 128],
    'green': [0, 128, 0],
    'greenyellow': [173, 255, 47],
    'honeydew': [240, 255, 240],
    'hotpink': [255, 105, 180],
    'indianred': [205, 92, 92],
    'indigo': [75, 0, 130],
    'ivory': [255, 255, 240],
    'khaki': [240, 230, 140],
    'lavender': [230, 230, 250],
    'lavenderblush': [255, 240, 245],
    'lawngreen': [124, 252, 0],
    'lemonchiffon': [255, 250, 205],
    'lightblue': [173, 216, 230],
    'lightcoral': [240, 128, 128],
    'lightcyan': [224, 255, 255],
    'lightgoldenrodyellow': [250, 250, 210],
    'lightgray': [211, 211, 211],
    'lightgrey': [211, 211, 211],
    'lightgreen': [144, 238, 144],
    'lightpink': [255, 182, 193],
    'lightsalmon': [255, 160, 122],
    'lightseagreen': [32, 178, 170],
    'lightskyblue': [135, 206, 250],
    'lightslategray': [119, 136, 153],
    'lightslategrey': [119, 136, 153],
    'lightsteelblue': [176, 196, 222],
    'lightyellow': [255, 255, 224],
    'lime': [0, 255, 0],
    'limegreen': [50, 205, 50],
    'linen': [250, 240, 230],
    'magenta': [255, 0, 255],
    'maroon': [128, 0, 0],
    'mediumaquamarine': [102, 205, 170],
    'mediumblue': [0, 0, 205],
    'mediumorchid': [186, 85, 211],
    'mediumpurple': [147, 112, 216],
    'mediumseagreen': [60, 179, 113],
    'mediumslateblue': [123, 104, 238],
    'mediumspringgreen': [0, 250, 154],
    'mediumturquoise': [72, 209, 204],
    'mediumvioletred': [199, 21, 133],
    'midnightblue': [25, 25, 112],
    'mintcream': [245, 255, 250],
    'mistyrose': [255, 228, 225],
    'moccasin': [255, 228, 181],
    'navajowhite': [255, 222, 173],
    'navy': [0, 0, 128],
    'oldlace': [253, 245, 230],
    'olive': [128, 128, 0],
    'olivedrab': [107, 142, 35],
    'orange': [255, 165, 0],
    'orangered': [255, 69, 0],
    'orchid': [218, 112, 214],
    'palegoldenrod': [238, 232, 170],
    'palegreen': [152, 251, 152],
    'paleturquoise': [175, 238, 238],
    'palevioletred': [216, 112, 147],
    'papayawhip': [255, 239, 213],
    'peachpuff': [255, 218, 185],
    'peru': [205, 133, 63],
    'pink': [255, 192, 203],
    'plum': [221, 160, 221],
    'powderblue': [176, 224, 230],
    'purple': [128, 0, 128],
    'red': [255, 0, 0],
    'rosybrown': [188, 143, 143],
    'royalblue': [65, 105, 225],
    'saddlebrown': [139, 69, 19],
    'salmon': [250, 128, 114],
    'sandybrown': [244, 164, 96],
    'seagreen': [46, 139, 87],
    'seashell': [255, 245, 238],
    'sienna': [160, 82, 45],
    'silver': [192, 192, 192],
    'skyblue': [135, 206, 235],
    'slateblue': [106, 90, 205],
    'slategray': [112, 128, 144],
    'slategrey': [112, 128, 144],
    'snow': [255, 250, 250],
    'springgreen': [0, 255, 127],
    'steelblue': [70, 130, 180],
    'tan': [210, 180, 140],
    'teal': [0, 128, 128],
    'thistle': [216, 191, 216],
    'tomato': [255, 99, 71],
    'turquoise': [64, 224, 208],
    'violet': [238, 130, 238],
    'wheat': [245, 222, 179],
    'white': [255, 255, 255],
    'whitesmoke': [245, 245, 245],
    'yellow': [255, 255, 0],
    'yellowgreen': [154, 205, 50],
  };

  // color parsing function originally from
  // http://plugins.jquery.com/files/jquery.color.js.txt
  // (with slight modifications)

  // Parse strings looking for color tuples [255,255,255]
  rgbNumRE = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/;
  rgbPercRE = /rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/;
  rgbHash6RE = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/;
  rgbHash3RE = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/;

  strToRgb(color) {
    var result;

    // Check if we're already dealing with an array of colors
    //         if ( color && color.constructor == Array && color.length == 3 )
    //             return color;

    // Look for rgb(num,num,num)
    if (result = this.rgbNumRE.exec(color))
      return [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])];

    // Look for rgb(num%,num%,num%)
    if (result = this.rgbPercRE.exec(color))
      return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];

    // Look for #a0b1c2
    if (result = this.rgbHash6RE.exec(color))
      return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];

    // Look for #fff
    if (result = this.rgbHash3RE.exec(color))
      return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];

    // Otherwise, we're most likely dealing with a named color
    return this.colors[$.trim(color).toLowerCase()];
  }

  rgbToStr(rgb) {
    // TODO: there has to be a better way, even in JS
    var r = Math.floor(rgb[0]).toString(16);
    var g = Math.floor(rgb[1]).toString(16);
    var b = Math.floor(rgb[2]).toString(16);
    // pad
    r = r.length < 2 ? '0' + r : r;
    g = g.length < 2 ? '0' + g : g;
    b = b.length < 2 ? '0' + b : b;
    return ('#' + r + g + b);
  }

  // Functions rgbToHsl and hslToRgb originally from 
  // http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
  // implementation of functions in Wikipedia
  // (with slight modifications)

  // RGB to HSL color conversion
  rgbToHsl(rgb: [number, number, number]): [number, number, number] {
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  hslToRgb(hsl: [number, number, number]) {
    var h = hsl[0], s = hsl[1], l = hsl[2];

    var r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = this.hue2rgb(p, q, h + 1 / 3);
      g = this.hue2rgb(p, q, h);
      b = this.hue2rgb(p, q, h - 1 / 3);
    }

    return [r * 255, g * 255, b * 255];
  }

  adjustLightnessCache = {};

  /**
   * Given color string and -1<=adjust<=1, returns color string where lightness (in the HSL sense)
   * is adjusted by the given amount, the larger the lighter: -1 gives black, 1 white, and 0
   * the given color.
   */
  adjustColorLightness(colorstr: string, adjust: number) {
    if (!(colorstr in this.adjustLightnessCache)) {
      this.adjustLightnessCache[colorstr] = {}
    }
    if (!(adjust in this.adjustLightnessCache[colorstr])) {
      var rgb = this.strToRgb(colorstr);
      if (rgb === undefined) {
        // failed color string conversion; just return the input
        this.adjustLightnessCache[colorstr][adjust] = colorstr;
      } else {
        var hsl = this.rgbToHsl(rgb);
        if (adjust > 0.0) {
          hsl[2] = 1.0 - ((1.0 - hsl[2]) * (1.0 - adjust));
        } else {
          hsl[2] = (1.0 + adjust) * hsl[2];
        }
        var lightRgb = this.hslToRgb(hsl);
        this.adjustLightnessCache[colorstr][adjust] = this.rgbToStr(lightRgb);
      }
    }
    return this.adjustLightnessCache[colorstr][adjust];
  }

  keyValRE = /^([^=]+)=(.*)$/; // key=value
  isDigitsRE = /^[0-9]+$/;

  paramArray(val) {
    val = val || [];
    var len = val.length;
    var arr = [];
    for (var i = 0; i < len; i++) {
      if ($.isArray(val[i])) {
        arr.push(val[i].join('~'));
      } else {
        // non-array argument; this is an error from the caller
        console.error('param: Error: received non-array-in-array argument [', i, ']', ':', val[i], '(fix caller)');
      }
    }
    return arr;
  };

  param(args) {
    if (!args) return '';
    var vals = [];
    for (var key in args) {
      if (args.hasOwnProperty(key)) {
        var val = args[key];
        if (val == undefined) {
          console.error('Error: received argument', key, 'with value', val);
          continue;
        }
        // values normally expected to be arrays, but some callers screw
        // up, so check
        if ($.isArray(val)) {
          var arr = this.paramArray(val);
          vals.push(key + '=' + arr.join(','));
        } else {
          // non-array argument; this is an error from the caller
          console.error('param: Error: received non-array argument', key, ':', val, '(fix caller)');
        }
      }
    }
    return vals.join('&');
  };

  profiles = {};
  profileStarts: Record<string, Date> = {};
  profileOn = false;
  profileEnable(on) {
    if (on === undefined) on = true;
    this.profileOn = on;
  }; // profileEnable

  profileClear() {
    if (!this.profileOn) return;
    this.profiles = {};
    this.profileStarts = {};
  }; // profileClear

  profileStart(label) {
    if (!this.profileOn) return;
    this.profileStarts[label] = new Date();
  }; // profileStart

  profileEnd(label) {
    if (!this.profileOn) return;
    var profileElapsed = new Date().valueOf() - this.profileStarts[label].valueOf();
    if (!this.profiles[label]) this.profiles[label] = 0;
    this.profiles[label] += profileElapsed;
  }; // profileEnd

  profileReport() {
    if (!this.profileOn) return;
    if (window.console) {
      $.each(this.profiles, (label, time) => {
        console.log("profile " + label, time);
      });
      console.log("-------");
    }
  }; // profileReport

  // container: ID or jQuery element
  // collData: the collection data (in the format of the result of
  //   http://.../brat/ajax.cgi?action=getCollectionInformation&collection=...
  // docData: the document data (in the format of the result of
  //   http://.../brat/ajax.cgi?action=getDocument&collection=...&document=...
  // returns the embedded visualizer's dispatcher object
  embed(container, collData, docData) {
    var dispatcher = new Dispatcher();
    var visualizer = new Visualizer(dispatcher, container);
    new VisualizerUI(dispatcher, visualizer.svg);
    docData.collection = null;
    dispatcher.post('collectionLoaded', [collData]);
    dispatcher.post('requestRenderData', [docData]);
    return dispatcher;
  };

  // container: ID or jQuery element
  // collDataURL: the URL of the collection data, or collection data
  //   object (if pre-fetched)
  // docDataURL: the url of the document data (if pre-fetched, use
  //   simple `embed` instead)
  // callback: optional; the callback to call afterwards; it will be
  //   passed the embedded visualizer's dispatcher object
  embedByURL(container, collDataURL: string, docDataURL: string, callback?) {
    var collData, docData;
    var handler = () => {
      if (collData && docData) {
        var dispatcher = this.embed(container, collData, docData);
        if (callback) callback(dispatcher);
      }
    };
    if (typeof (container) == 'string') {
      $.getJSON(collDataURL, (data) => { collData = data; handler(); });
    } else {
      collData = collDataURL;
    }
    $.getJSON(docDataURL, (data) => { docData = data; handler(); });
  };
}