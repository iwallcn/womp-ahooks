import { request } from 'ice';

export default {
  // 获取列表
  async getList(warehouseCode, carrierType) {
    return await request(`/appointmentConfigure/selectBy?warehouseCode=${warehouseCode}&carrierType=${carrierType}`);
  },

  // 新增预约配置信息
  async insert(data) {
    return await request.post(`/appointmentConfigure/insert`, data);
  },

  // 新增预约配置信息表格
  async addOrUpdateConfigureGoods(data) {
    return await request.post(`/appointmentConfigure/addOrUpdateConfigureGoods`, data);
  },

  // 修改预约配置启用状态
  async updateEnabled(data) {
    return await request(`/appointmentConfigure/updateEnabled?configNo=${data.configNo}&enabled=${data.enabled}`);
  },

  // 修改预约配置
  async update(data) {
    return await request.post(`/appointmentConfigure/update`, data);
  },

  // 查询预约配置详情
  async selectOneBy(configNo) {
    return await request(`/appointmentConfigure/selectOneBy?configNo=${configNo}`);
  },

  // 新增UNIT配置
  async insertUnitConfig(data) {
    return await request.post(`/appointmentConfigure/insertUnitConfig`, data);
  },

  // 新增船期配置
  async insertShipConfig(data) {
    return await request.post(`/appointmentConfigure/insertShipConfig`, data);
  },
}
