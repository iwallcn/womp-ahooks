import { request } from 'ice';

interface IState {
  name: string;
  department: string;
  avatar: string;
  userid: number | null;
}

export default {
  // 定义 model 的初始 state
  state: {
    name: 'default',
    department: '',
    avatar: '',
    userid: null,
  },
  // 定义处理该模型副作用的函数, 异步处理
  effects: (dispatch) => ({
    async fetchUserProfile() {
      const res = await request('/api/profile');
      if (res.status === 'SUCCESS') {
        dispatch.user.update(res.data);
      }
    },
  }),
  // 定义改变该模型状态的纯函数，同步更新
  reducers: {
    update(prevState: IState, payload: IState) {
      return { ...prevState, ...payload };
    },
  },
};
