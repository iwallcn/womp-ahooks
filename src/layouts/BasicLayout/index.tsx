import React, { useState, useEffect } from 'react';
import { Shell, ConfigProvider } from '@alifd/next';
import store from '@/store';
import PageNav from './components/PageNav';
import Notice from './components/Notice';
import Lang from './components/Lang';
import Services from './components/Services';
import HeaderAvatar from './components/HeaderAvatar';
import Logo from './components/Logo';
import Footer from './components/Footer';

(function () {
  const throttle = function (type: string, name: string, obj: Window = window) {
    let running = false;

    const func = () => {
      if (running) {
        return;
      }

      running = true;
      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };

    obj.addEventListener(type, func);
  };

  throttle('resize', 'optimizedResize');
})();

interface IGetDevice {
  (width: number): 'phone' | 'tablet' | 'desktop';
}
export default function BasicLayout({
  children
}) {
  const getDevice: IGetDevice = width => {
    const isPhone =
      typeof navigator !== 'undefined' &&
      navigator &&
      navigator.userAgent.match(/phone/gi);

    if (width < 680 || isPhone) {
      return 'phone';
    } else if (width < 1280 && width > 680) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  };

  const [device, setDevice] = useState(getDevice(NaN));
  window.addEventListener('optimizedResize', e => {
    setDevice(getDevice(e && e.target && e.target.innerWidth));
  });

  const [basic, basicDispatchers] = store.useModel('basic');
  useEffect(() => {
    basicDispatchers.getAjaxData();
  }, []);

  return (
    <ConfigProvider device={device}>
      <Shell
        type="brand"
        style={{
          minHeight: '100vh',
        }}
      >
        <Shell.Branding>
          <Logo
            image={basic.logo}
            text={basic.title}
          />
        </Shell.Branding>
        <Shell.Navigation
          direction="hoz"
          align="left"
          style={{
            marginRight: 10,
          }}
        >
          <Services />
        </Shell.Navigation>
        <Shell.Action>
          <Lang />
          <Notice />
          <HeaderAvatar
            user={basic.ajaxData.user}
          />
        </Shell.Action>
        <Shell.Navigation>
          <PageNav
            menus={basic.ajaxData.menu}
          />
        </Shell.Navigation>

        <Shell.Content>
          {children}
        </Shell.Content>
        <Shell.Footer>
          <Footer
            foot={basic.ajaxData.foot}
          />
        </Shell.Footer>
      </Shell>
    </ConfigProvider>
  );
}
