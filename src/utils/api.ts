import { request, config } from 'ice';
import Cookies from 'js-cookie';

/***
 * 存放通用接口
 */
export default {
  // 获取左侧菜单
  async getAllByUser() {
    return await request(`/order/menu/getAllByUser?lan=${Cookies.get('lang')}`);
  },

  // 获取字典数据
  async getDictionary() {
    return await request(`${config.mainApi}/static/dictionary/all?lan=${Cookies.get('lang')}`);
  },

  // 获取翻译语言包
  async getLang() {
    return await request(`${config.mainApi}/translation/getAll?language=${Cookies.get('lang')}`);
  },

  // 获取所有仓库
  async getWHAll() {
    return await request({
      url: `${config.mainApi}/static/warehouses/all`,
      method: 'POST',
      data: { lan: Cookies.get('lang') },
      transformRequest: [function (data) {
        let ret = '';
        for (let it in data) {
          ret += `${it}=${data[it]}&`;
        }
        return ret.substr(0, ret.length - 1);
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      }
    });
  },

  /**
   * 全局数据处理：
   * 将语言包，字典，仓库存在缓存中，并挂载在全局环境中
   */
  setGlobal(arr) {
    const lang = Cookies.get('lang');
    let settings = {
      async: false,
      cache: true,
      callback: null,
      debug: false,
      encoding: "UTF-8",
      language: lang,
      mode: "map",
      name: "messages",
      namespace: null,
      path: "/i18n/"
    }
    let data = parseData(arr[0], settings);
    sessionStorage.setItem(`LANG_PACK_${lang}`, JSON.stringify(data)); // 语言包
    sessionStorage.setItem(`FPX.IRF.HOOK.DICT_${lang}`, JSON.stringify(arr[1])); // 字典
    sessionStorage.setItem(`ORIGIN.FPX.IRF.WH_${lang}_ALL`, JSON.stringify(arr[2])); // 仓库处理

    window.GLOBAL_LANG = data;
    window.GLOBAL_DICT = arr[1];
    window.GLOBAL_WHALL = get_WH_ALL(arr[2]);
  },
}

/**
 * 将接口返回的仓库数据解析成组件tree数据结构
 * @param WH_ALL 
 */
const get_WH_ALL = (WH_ALL) => {
  if (WH_ALL) {
    let treeData = [{
      label: 'All',
      value: ' ',
      disabled: true,
      selectable: false,
      children: []
    }];
    let temp: any = [];
    for (let i = 0; i < WH_ALL.length; i++) {
      let item = WH_ALL[i];
      item.label = item.name;
      item.value = item.code;
      item.key = item.code;
      item.sortnum = item.sortNum;
      delete item.sortNum;
      if (item.warehouses && item.warehouses.length) {
        item.disabled = true;
        item.children = [];
        for (let j = 0; j < item.warehouses.length; j++) {
          let val = item.warehouses[j];
          val.label = val.name;
          val.value = val.code;
          val.key = val.code;
          val.countrycode = val.countryCode;
          delete val.countryCode;
          item.children.push(val);
        }
      }
      temp.push(item);
    }
    // treeData[0].children = temp;
    return temp;
  } else {
    return []
  }
}

/**
 * 将接口返回的语言包数据解析成key:value格式
 * @param data 
 * @param settings 
 */
const parseData = (data, settings) => {
  var lines = data.split(/\n/);
  var regPlaceHolder = /(\{\d+})/g;
  var regRepPlaceHolder = /\{(\d+)}/g;
  var unicodeRE = /(\\u.{4})/gi;
  var lang = {}
  for (var i = 0, j = lines.length; i < j; i++) {
    var line = lines[i];

    line = line.trim();
    if (line.length > 0 && line.match('^#') != '#') {
      // skip comments
      var pair = line.split('=');
      if (pair.length > 0) {
        /** Process key & value */
        var name = decodeURI(pair[0]).trim();
        var value = pair.length == 1 ? '' : pair[1];
        // process multi-line values
        while (value.search(/\\$/) != -1) {
          value = value.substring(0, value.length - 1);
          value += lines[++i].trimRight();
        }
        // Put values with embedded '='s back together
        for (var s = 2; s < pair.length; s++) {
          value += '=' + pair[s];
        }
        value = value.trim();

        /** Mode: bundle keys in a map */
        if (settings.mode == 'map' || settings.mode == 'both') {
          // handle unicode chars possibly left out
          var unicodeMatches = value.match(unicodeRE);
          if (unicodeMatches) {
            unicodeMatches.forEach(function (match) {
              value = value.replace(match, unescapeUnicode(match));
            });
          }
          // add to map
          // if (settings.namespace) {
          //   $.i18n.map[settings.namespace][name] = value;
          // } else {
          //   $.i18n.map[name] = value;
          // }
          lang[name] = value;
        }

        /** Mode: bundle keys as vars/functions */
        if (settings.mode == 'vars' || settings.mode == 'both') {
          value = value.replace(/"/g, '\\"'); // escape quotation mark (")

          // make sure namespaced key exists (eg, 'some.key')
          checkKeyNamespace(name);

          // value with variable substitutions
          if (regPlaceHolder.test(value)) {
            var parts = value.split(regPlaceHolder);
            // process function args
            var first = true;
            var fnArgs = '';
            var usedArgs = [];
            parts.forEach(function (part) {
              if (regPlaceHolder.test(part) && (usedArgs.length === 0 || usedArgs.indexOf(part) == -1)) {
                if (!first) {
                  fnArgs += ',';
                }
                fnArgs += part.replace(regRepPlaceHolder, 'v$1');
                usedArgs.push(part);
                first = false;
              }
            });
            parsed += name + '=function(' + fnArgs + '){';
            // process function body
            var fnExpr = '"' + value.replace(regRepPlaceHolder, '"+v$1+"') + '"';
            parsed += 'return ' + fnExpr + ';' + '};';
            // simple value
          } else {
            parsed += name + '="' + value + '";';
          }
        } // END: Mode: bundle keys as vars/functions
      } // END: if(pair.length > 0)
    } // END: skip comments
  }
  return lang;
}

const checkKeyNamespace = (key) => {
  var regDot = /\./;
  if (regDot.test(key)) {
    var fullname = '';
    var names = key.split(/\./);
    for (var i = 0, j = names.length; i < j; i++) {
      var name = names[i];
      if (i > 0) {
        fullname += '.';
      }
      fullname += name;
      if (eval('typeof ' + fullname + ' == "undefined"')) {
        eval(fullname + '={};');
      }
    }
  }
}

const unescapeUnicode = (str) => {
  // unescape unicode codes
  var codes = [];
  var code = parseInt(str.substr(2), 16);
  if (code >= 0 && code < Math.pow(2, 16)) {
    codes.push(code);
  }
  // convert codes to text
  return codes.reduce(function (acc, val) {
    return acc + String.fromCharCode(val);
  }, '');
}
