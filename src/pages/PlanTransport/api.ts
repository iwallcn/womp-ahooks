import { Upload } from '@alifd/next';
import { request } from 'ice';

export default {
  // 获取物流计划导入列表
  async getList(data) {
    return await request.post(`/planTransport/queryPage`, data);
  },

  // 获取物流计划导入列表
  async updateStatus(status,tid) {
    var url = status=='0'?`/planTransport/disable`:`/planTransport/enable`;
    return await request(url+`?tid=${tid}`);
  },

  async upload(data) {
    return await request.post(`/planTransport/import`, data);
  },

  async download() {
    return await request(`/planContainer/flowDownload`);
  },


   /**  物流计划排柜列表 */

  // 获取物流计划排柜列表
  async getLogisticsCabinetList(data) {
    return await request.post(`/womp/iconsignment/plan/queryPage`, data);
  },
  // 获取物流计划排柜列表
  async exportLogisticsCabinet(data) {
    return await request.post(`/womp/iconsignment/plan/export`,data);
  },

  
 
  /**  排柜计划 */

  // 获取排柜计划列表
  async getPlanContainerList(data) {
    return await request.post(`/planContainer/list`, data);
  },

  /** 新增委托单 */
  async getPlanContainerDetail(data) {
    return await request.post(`/planContainer/getPlanContainerDetail`, data);
  },

   /** 新增委托单 */
   async getPlanContainer(data) {
    return await request.post(`/planContainer/getPlanContainer?id=`+data);
  },

    /** 新增委托单 */
    async saveOrupdatePlanContainer(data) {
      return await request.post(`/planContainer/saveorupdateContainer`, data);
    },

}
