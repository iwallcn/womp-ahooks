import * as React from 'react';
import { runApp } from 'ice';
import LocaleProvider from '@/components/LocaleProvider';
import { Message } from '@alifd/next';
import { getLocale } from '@/locales/locale';
import api from '@/utils/api';


// 设置国际化
const locale = getLocale();

// 应用进行全局配置，设置路由、运行环境、请求、日志等
const appConfig = {
  request: {
    baseURL: process.env.NODE_ENV === 'development' ? '/mainApi' : '',
    // 可选的，全局设置 request 是否返回 response 对象，默认为 false
    withFullResponse: false,
    withCredentials: true,
    // ...RequestConfig 其他参数
    // 拦截器
    interceptors: {
      request: {
        onConfig: (config) => {
          // 发送请求前：可以对 RequestConfig 做一些统一处理
          return config;
        },
        onError: (error) => {
          return Promise.reject(error);
        }
      },
      response: {
        onConfig: (response) => {
          // 左侧菜单列表接口不执行下面的数据处理逻辑
          if (response.config.url.indexOf('innerUedInfo') > -1) {
            return response;
          }
          // 请求成功：可以做全局的 toast 展示，或者对 response 做一些格式化
          // if (response.data.code !== '0') {
          //   Message.error('请求失败');
          // }
          return response;
        },
        onError: (err) => {
          if (err && err.response && err.response.status) {
            switch (err.response.status) {
              case 400:
                err.message = '错误请求'
                break
              case 401:
                err.message = '未授权，请重新登录'
                break
              case 403:
                err.message = '拒绝访问'
                break
              case 404:
                err.message = '请求错误，未找到该资源'
                break
              case 405:
                err.message = '请求方法未允许'
                break
              case 408:
                err.message = '请求超时'
                break
              case 500:
                err.message = '服务器端出错'
                break
              case 501:
                err.message = '网络未实现'
                break
              case 502:
                err.message = '网络错误'
                break
              case 503:
                err.message = '服务不可用'
                break
              case 504:
                err.message = '网络超时'
                break
              case 505:
                err.message = 'http版本不支持该请求'
                break
              default:
                err.message = `连接错误`
            }
          } else {
            err.message = '连接到服务器失败'
          }
          Message.error(err.message)
          return Promise.reject(err);
        }
      },
    }
  },
  app: {
    rootId: 'ice-container',
    // 可选，自定义添加 Provider
    addProvider: ({ children }) => (
      <LocaleProvider locale={locale}>{children}</LocaleProvider>
    ),
  },
  router: {
    type: 'browser'
  }
};

/**
 * 处理全局数据：语言包，字典，仓库
 */
Promise.all([
  api.getLang(),
  api.getDictionary(),
  api.getWHAll()
]).then(res => {
  api.setGlobal(res);
  runApp(appConfig); // 用于创建渲染整个应用
});
// runApp(appConfig);
