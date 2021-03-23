import Cookies from 'js-cookie';

// 对内系统：都采用.i4px.com  不区分环境(test，uat，prod)
const _domain = window.origin.indexOf('localhost') != -1 ? '' : {domain: '.i4px.com', path: '/'}

/**
 * 头部切换语言
 * @param {} lang 
 */
function setLocale(lang) {
  if (lang !== undefined && !/^([a-z]{2})-([A-Z]{2})$/.test(lang)) {
    throw new Error('setLocale lang format error');
  }
  if (getLocale() !== lang) {
    window.localStorage.setItem('lang', lang);
    Cookies.set('lang', lang ? lang.split('-')[0] : '', {expires: 30, ..._domain});
    window.location.reload();
  }
}

/**
 * 目前组件中支持中英繁日四种语言 zh-CN, ja-JP, en-US
 * localStorage: zh-CN
 * cooked lang : zh
 */
function getLocale() {
  let cookie = Cookies.get('lang');
  let _lang = '';
  if(cookie == undefined || cookie == '') { // 直接进入
    window.localStorage.setItem('lang', navigator.language);
    Cookies.set('lang', navigator.language.split('-')[0], {expires: 30, ..._domain});
  } else { // 可能从其他系统进入
    if(cookie == 'zh') {
      _lang = 'zh-CN';
    } else if(cookie == 'ja') {
      _lang = 'ja-JP';
    } else if(cookie == 'en') {
      _lang = 'en-US';
    } else {
      _lang = 'en-US';
    }
    window.localStorage.setItem('lang', _lang);
    Cookies.set('lang', _lang.split('-')[0], {expires: 30, ..._domain});
  }
  _lang = localStorage.getItem('lang') == 'de-CH' ? 'en-US' : _lang;
  return _lang;
}
export { setLocale, getLocale };
