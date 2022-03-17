import React from 'react';
import styles from '../App.module.css';
import { ReactComponent as Check } from '../check-solid.svg';
import { sortBy } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';

const SORTS: { [index: string]: any } = {
    NONE: (list: Stories) => list,
    TITLE: (list: Stories) => sortBy(list, 'title'),
    AUTHOR: (list: Stories) => sortBy(list, 'author'),
    COMMENTS: (list: Stories) => sortBy(list, 'num_comments').reverse(),
    POINTS: (list: Stories) => sortBy(list, 'points').reverse(),
};

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

const List = ({ list, onRemoveItem }: ListProps) => {
    const [sort, setSort] = React.useState({
        sortKey: 'NONE',
        isReverse: false,
    });

    const handleSort = (sortKey: string) => {
        // if sorting is already applied for that sortKey -> the just reverse sort, else sort by new sortKey (with a normal sort)
        const isReverse = sort.sortKey === sortKey && !sort.isReverse;
        // setSort({ sortKey: sortKey, isReverse: isReverse }); long version  <--> below applied shorthand object initializer notation
        setSort({ sortKey, isReverse });
    };

    const sortFunction = SORTS[sort.sortKey];
    const sortedList = sort.isReverse
        ? sortFunction(list).reverse()
        : sortFunction(list);

    return (
        <>
            <div style={{ display: 'flex' }}>
                <span style={{ width: '40%' }}>
                    <button
                        type="button"
                        onClick={() => handleSort('TITLE')}
                        className={
                            sort.sortKey === 'TITLE' ? styles.buttonActive : ''
                        }
                    >
                        Title
                        {sort.sortKey === 'TITLE' ? (
                            sort.isReverse ? (
                                <FontAwesomeIcon icon={faSortDown} />
                            ) : (
                                <FontAwesomeIcon icon={faSortUp} />
                            )
                        ) : (
                            ''
                        )}
                    </button>
                </span>
                <span style={{ width: '30%' }}>
                    <button
                        type="button"
                        onClick={() => handleSort('AUTHOR')}
                        className={
                            sort.sortKey === 'AUTHOR' ? styles.buttonActive : ''
                        }
                    >
                        Author
                        {sort.sortKey === 'AUTHOR' ? (
                            sort.isReverse ? (
                                <FontAwesomeIcon icon={faSortDown} />
                            ) : (
                                <FontAwesomeIcon icon={faSortUp} />
                            )
                        ) : (
                            ''
                        )}
                    </button>
                </span>
                <span style={{ width: '10%' }}>
                    <button
                        type="button"
                        onClick={() => handleSort('COMMENTS')}
                        className={
                            sort.sortKey === 'COMMENTS'
                                ? styles.buttonActive
                                : ''
                        }
                    >
                        Comments
                        {sort.sortKey === 'COMMENTS' ? (
                            sort.isReverse ? (
                                <FontAwesomeIcon icon={faSortUp} />
                            ) : (
                                <FontAwesomeIcon icon={faSortDown} />
                            )
                        ) : (
                            ''
                        )}
                    </button>
                </span>
                <span style={{ width: '10%' }}>
                    <button
                        type="button"
                        onClick={() => handleSort('POINTS')}
                        className={
                            sort.sortKey === 'POINTS' ? styles.buttonActive : ''
                        }
                    >
                        Points
                        {sort.sortKey === 'POINTS' ? (
                            sort.isReverse ? (
                                <FontAwesomeIcon icon={faSortUp} />
                            ) : (
                                <FontAwesomeIcon icon={faSortDown} />
                            )
                        ) : (
                            ''
                        )}
                    </button>
                </span>
                <span style={{ width: '10%' }}>Actions</span>
            </div>

            {sortedList.map((item: Story) => (
                <Item
                    key={item.objectID}
                    item={item}
                    onRemoveItem={onRemoveItem}
                />
            ))}
        </>
    );
};

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
