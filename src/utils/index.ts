/**
 * 模块注释：
 * 这里用来设置各种缓存，eg：语言包，所有仓库，字典数据；
 * 然后再读取各种缓存数据，转换成json格式
 */

export const renderTime = (date) => {
  if (!date) {
    return '';
  }
  var dateee = new Date(date).toJSON();
  return new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
}

/**
 * 读取字典数据
 * 提供类型，根据code读取对应的name
 * @param type 
 * @param code 
 */
export const convertDictByCode = (type, code) => {
  let item = window.GLOBAL_DICT[type].filter(val => val.code === code);
  if (!item.length) {
    return ''
  }
  return item[0].name;
}

/**
 * 读取字典数据
 * 提供类型，根据type获取对应的数组
 * @param type 
 */
export const convertDictByType = type => {
  let json_pack = window.GLOBAL_DICT;
  if (!json_pack) {
    return [];
  } else {
    return json_pack[type];
  }
}

/**
 * 根据code获取name
 * @param whAll 
 * @param warehouseCode 
 */
export const getWareName = (whAll, warehouseCode) => {
  for (let i = 0; i < whAll.length; i++) {
    let sub = whAll[i].children;
    if (sub) {
      for (let j = 0; j < sub.length; j++) {
        if (sub[j].code == warehouseCode) {
          return sub[j].name;
        }
      }
    }
  }
  return ''
}
