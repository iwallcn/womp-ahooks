import { request } from 'ice';

export default {
  // 获取列表
  async getList(warehouseCode) {
    return await request(`/appointmentConfigure/getShipConfigList?warehouseCode=${warehouseCode}`);
  },

  // 新增船期配置
  async insertShipConfig(data) {
    return await request.post(`/appointmentConfigure/insertShipConfig`, data);
  },

  // 修改船期配置
  async update(data) {
    return await request.post(`/appointmentConfigure/updateShipConfig`, data);
  },

  // 查询船期配置详情
  async selectOneBy(shipConfigNo) {
    return await request(`/appointmentConfigure/getShipConfigDetail?shipConfigNo=${shipConfigNo}`);
  },

  // 删除船期配置
  async delShipConfig(configNo) {
    return await request(`/appointmentConfigure/delShipConfig?configNo=${configNo}`);
  },

  // 排队预约 coNo actualDate
  async queuingAppointment(data) {
    return await request.post(`/appointment/queuingAppointment`, data);
  },
}
