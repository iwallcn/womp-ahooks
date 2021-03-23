import React, { SFC } from 'react';
import { Breadcrumb, Box, Typography } from '@alifd/next';
import styles from './index.module.scss';
import { CustomIcon } from '../Iconfont';
import { useHistory } from 'ice';

export interface PageHeaderProps {
  breadcrumbs?: Array<{ name: string; path?: string }>;
  title?: string;
  description?: string;
}

const PageHeader: SFC<PageHeaderProps> = (props) => {
  const history = useHistory();
  const { breadcrumbs, title, description, ...others } = props;
  return (
    <Box spacing={8} className={styles.PageHeader} {...others}>
      {/* <CustomIcon type="back" className="goBack" onClick={() => window.history.back()} /> */}
      {
        breadcrumbs && breadcrumbs.length > 0 ? (
          <>
            <Breadcrumb className={styles.Breadcrumbs} separator=" / ">
              {
                breadcrumbs.map((item, index) => (
                  <Breadcrumb.Item link={item.path} key={index}>{item.name}</Breadcrumb.Item>
                ))
              }
            </Breadcrumb>
          </>
        ) : null
      }

      {
        title && (
          <Typography.Text className={styles.Title}>{title}</Typography.Text>
        )
      }

      {
        description && (
          <Typography.Text className={styles.Description}>{description}</Typography.Text>
        )
      }
    </Box>
  );
};

export default PageHeader;
