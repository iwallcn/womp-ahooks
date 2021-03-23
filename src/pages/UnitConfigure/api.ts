import { request } from 'ice';

export default {
  // 获取列表
  async getList(warehouseCode) {
    return await request(`/appointmentConfigure/queryUnitConfigList?warehouseCode=${warehouseCode}`);
  },

  // 修改unit配置
  async update(data) {
    return await request.post(`/appointmentConfigure/updateUnitConfig`, data);
  },

  // 新增unit配置
  async insertUnitConfig(data) {
    return await request.post(`/appointmentConfigure/insertUnitConfig`, data);
  },

  // 删除unit配置
  async delUnitConfig(configNo) {
    return await request(`/appointmentConfigure/delUnitConfig?configNo=${configNo}`);
  }
}
