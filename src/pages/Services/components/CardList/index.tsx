import React, { useState, useEffect } from 'react';
import { Box, Search, Card, Tag, ResponsiveGrid, Divider, Typography, Loading } from '@alifd/next';
// import { store } from 'ice';
import store from '@/store';
import styles from './index.module.scss';

const { Group: TagGroup, Selectable: SelectableTag } = Tag;
const { Cell } = ResponsiveGrid;



export interface ICardItem {
  title?: string;
  content?: string;
  link?: string[];
};

export interface IDataSource {
  cards: ICardItem[];
  tagsA: string[];
  tagA: string;
  tagsB: string[];
  tagB: string;
};

const CardList: React.FunctionComponent<CardListProps> = (props: CardListProps): JSX.Element => {

  const dataSource: IDataSource = {
    cards: [],
    tagsA: [],
    tagA: '',
    tagsB: ['全部'],
    tagB: '全部'
  };

  const tagsBMap = {};
  const services = {};
  const initDataSource = (basic): void => {
    basic.ajaxData.services.forEach((item, i) => {
      tagsBMap[item.name] = ['全部'];
      services[item.name] = [];
      dataSource.tagsA.push(item.name);
      if (i === 0) {
        dataSource.tagA = item.name;
      }
      item.categoryList.forEach(itm => {
        tagsBMap[item.name].push(itm.name);
        if (i === 0) {
          dataSource.tagsB.push(itm.name);
        }
        itm.systemList.forEach(it => {
          const card = {
            title: it.name,
            content: it.description,
            link: [it.url],
            tagB: itm.name
          };
          services[item.name].push(card);
          if (i === 0) {
            dataSource.cards.push(card);
          }
        });
      });
    });
  };

  const getCards = (tagA, tagB) => {
    let items = services[tagA];
    if (tagB !== '全部') {
      items = items.filter(item => {
        return item.tagB === tagB;
      });
    }
    return items;
  };

  const [basic] = store.useModel('basic');
  initDataSource(basic);

  const [tagAValue, setTagAValue] = useState(dataSource.tagA);
  const [tagBValue, setTagBValue] = useState(dataSource.tagB);
  const [tagsB, setTagsB] = useState(dataSource.tagsB);
  const [cards, setCards] = useState(dataSource.cards);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  });

  const onTagAValueChange = (v: string) => {
    setLoading(true);
    setTagAValue(v);
    setTagsB(tagsBMap[v]);
    setTagBValue('全部');
    setCards(getCards(v, '全部'));
  };

  const onTagBValueChange = (v: string) => {
    setLoading(true);
    setTagBValue(v);
    setCards(getCards(tagAValue, v));
  };

  const onSearchClick = (v: string) => {
    setLoading(true);
    let items = getCards(tagAValue, tagBValue);
    if (v) {
      items = items.filter(item => {
        return item.title.indexOf(v) > -1;
      })
    }
    setCards(items);
  };

  const renderTagListA = () => {
    return dataSource.tagsA.map((name: string) => (
      <SelectableTag key={name}
        checked={tagAValue === name}
        onChange={() => onTagAValueChange(name)}
      >{name}</SelectableTag>
    ));
  };

  const renderTagListB = () => {
    return tagsB.map((name: string) => (
      <SelectableTag key={name}
        checked={tagBValue === name}
        onChange={() => onTagBValueChange(name)}
      >{name}</SelectableTag>
    ));
  };

  const renderCards = () => {
    return cards.map((c: ICardItem, i: number) => (
      <Cell colSpan={3} className={styles.ListItem} key={i}>
        <div className={styles.main}>
          <div className={styles.content}>
            <div className={styles.title}>
              {c.title}
            </div>
            <div className={styles.info}>
              {c.content}
            </div>
            <div className={styles.link}>
              {c.link.map((link, index) => (
                <a key={index} href={link} target="_blank">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </Cell>
    ));
  };

  return (<>
    <Card free className={styles.CardList}>
      <Box align="center">
        <Search type="primary" hasIcon={true} size="large" placeholder="搜索产品与服务..." onSearch={onSearchClick} />
      </Box>
      <Divider dashed style={{ margin: '24px 0' }} />
      <Box className={styles.TagBox}>
        <div className={styles.TagBoxItem}>
          <Typography.Text className={styles.TagTitleName}>维度分类</Typography.Text>
          <TagGroup>{renderTagListA()}</TagGroup>
        </div>
        <div className={styles.TagBoxItem}>
          <Typography.Text className={styles.TagTitleName}>{tagAValue}</Typography.Text>
          <TagGroup>{renderTagListB()}</TagGroup>
        </div>
      </Box>
    </Card>
    <Loading visible={loading} inline={false}>
      <ResponsiveGrid gap={20}>
        {renderCards()}
      </ResponsiveGrid>
    </Loading>
  </>);
};

export default CardList;
