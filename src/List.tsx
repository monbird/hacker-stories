import React from 'react';
import styles from './App.module.css';
import { ReactComponent as Check } from './check-solid.svg';

type Story = {
    objectID: string;
    url: string;
    title: string;
    author: string;
    num_comments: number;
    points: number;
};

type Stories = Array<Story>;

type ListProps = {
    list: Stories;
    onRemoveItem: (item: Story) => void;
};

const List = ({ list, onRemoveItem }: ListProps) => (
    <>
        {list.map((item) => (
            <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        ))}
    </>
);

// const List = React.memo(({ list, onRemoveItem }) => // memo makes equality check for the props i.e component will not re-render if there was no change in props (list & onRemoveItem)
//     list.map((item) => (
//         <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
//     )));

type ItemProps = {
    item: Story;
    onRemoveItem: (item: Story) => void;
};

const Item = ({ item, onRemoveItem }: ItemProps) => (
    <div className={styles.item}>
        <span style={{ width: '40%' }}>
            <a href={item.url}>{item.title}</a>
        </span>
        <span style={{ width: '30%' }}>{item.author}</span>
        <span style={{ width: '10%' }}>{item.num_comments}</span>
        <span style={{ width: '10%' }}>{item.points}</span>
        <span style={{ width: '10%' }}>
            <button
                type="button"
                onClick={() => onRemoveItem(item)}
                className={`${styles.button} ${styles.buttonSmall}`}
            >
                <Check height="18px" width="18px" />
                Dismiss
            </button>
        </span>
    </div>
);

export default List;
export { Item };
