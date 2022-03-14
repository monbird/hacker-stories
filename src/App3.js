import React from 'react';
import axios from 'axios';
import styles from './App.module.css';
import cs from 'classnames';
import styled from 'styled-components';
import { ReactComponent as Check } from './check-solid.svg';
import { ReactComponent as Search } from './search-solid.svg';

const StyledContainer = styled.div`
    height: 100vh;
    padding: 20px;

    background: #83a4d4; /*fallback for old browsers */
    background: linear-gradient(to left, #b6fbff, #83a4d4);

    color: #171212;
`;

const StyledHeadlinePrimary = styled.h1`
    font-size: 48px;
    font-weight: 300;
    letter-spacing: 2px;
`;

const StyledItem = styled.div`
    display: flex;
    align-items: center;
    padding-bottom: 5px;
`;

const StyledColumn = styled.span`
    padding: 0 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    a {
        color: inherit;
    }

    width: ${(props) => props.width};
`;

const StyledButton = styled.button`
    background: transparent;
    border: 1px solid #171212;
    padding: 5px;
    cursor: pointer;
    transition: all 0.1s ease-in;

    &:hover {
        background: #171212;
        color: #ffffff;
    }
`;

const StyledButtonSmall = styled(StyledButton)`
    padding: 5px;
`;

const StyledButtonLarge = styled(StyledButton)`
    padding: 10px;
`;

const StyledSearchForm = styled.form`
    padding: 10px 0 20px 0;
    display: flex;
    align-items: baseline;
`;

const StyledLabel = styled.label`
    border-top: 1px solid #171212;
    border-left: 1px solid #171212;
    padding-left: 5px;
    font-size: 24px;
`;

const StyledInput = styled.input`
    border: none;
    border-bottom: 1px solid #171212;
    background-color: transparent;
    font-size: 24px;
`;

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const useSemiPersistentState = (key, initialState) => {
    const isMounted = React.useRef(false);

    const [value, setValue] = React.useState(
        localStorage.getItem(key) || initialState
    );

    React.useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            // console.log('A');
            localStorage.setItem(key, value);
        }
    }, [value, key]);

    return [value, setValue];
};

const storiesReducer = (state, action) => {
    switch (action.type) {
        case 'STORIES_FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case 'STORIES_FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case 'STORIES_FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        case 'REMOVE_STORY':
            return {
                ...state,
                data: state.data.filter(
                    (story) => action.payload.objectID !== story.objectID
                ),
            };
        default:
            throw new Error();
    }
};

const getSumComments = (stories) => {
    console.log('C');

    return stories.data.reduce(
        (result, value) => result + value.num_comments,
        0
    );
};

const App = () => {
    const [searchTerm, setSearchTerm] = useSemiPersistentState(
        'search',
        'React'
    );

    const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

    const [stories, dispatchStories] = React.useReducer(storiesReducer, {
        data: [],
        isLoading: false,
        isError: false,
    });

    const handleFetchStories = React.useCallback(async () => {
        dispatchStories({
            type: 'STORIES_FETCH_INIT',
        });

        try {
            const result = await axios.get(url);
            dispatchStories({
                type: 'STORIES_FETCH_SUCCESS',
                payload: result.data.hits,
            });
        } catch {
            dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
        }
    }, [url]);

    React.useEffect(() => {
        handleFetchStories();
    }, [handleFetchStories]);

    const handleRemoveStory = React.useCallback((item) => {
        dispatchStories({
            type: 'REMOVE_STORY',
            payload: item,
        });
    }, []);

    const handleSearchInput = React.useCallback((event) => {
        setSearchTerm(event.target.value);
    }, []);

    const handleSearchSubmit = React.useCallback(
        (event) => {
            setUrl(`${API_ENDPOINT}${searchTerm}`);
            event.preventDefault();
        },
        [searchTerm]
    );

    console.log('B:App');

    const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

    return (
        // <div className={styles.container}>
        <StyledContainer>
            <StyledHeadlinePrimary>
                My Hacker Stories with {sumComments} comments.
            </StyledHeadlinePrimary>
            {/* <h1 className={styles.headlinePrimary}>My Hacker Stories</h1> */}

            <SearchForm
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
                // className="button_large"
            />

            {stories.isError && <p>Something went wrong...</p>}

            {stories.isLoading ? (
                <p>Loading...</p>
            ) : (
                <List list={stories.data} onRemoveItem={handleRemoveStory} />
            )}
        </StyledContainer>
        // </div>
    );
};

const SearchForm = React.memo(
    ({
        searchTerm,
        onSearchInput,
        onSearchSubmit,
        // className,
    }) =>
        // <form onSubmit={onSearchSubmit} className={styles.searchForm}>
        //     <InputWithLabel
        //         id="search"
        //         value={searchTerm}
        //         isFocused
        //         onInputChange={onSearchInput}
        //     >
        //         <strong>Search: </strong>
        //     </InputWithLabel>
        //     <button
        //         type="submit"
        //         disabled={!searchTerm}
        //         // className="button button_large"
        //         // className={`button ${className}`}
        //         // className={`${styles.button} ${styles.buttonLarge}`}
        //         className={cs(styles.button, styles.buttonLarge)}
        //     >
        //         Submit
        //     </button>
        // </form>
        console.log('searchForm') || (
            <StyledSearchForm onSubmit={onSearchSubmit}>
                <InputWithLabel
                    id="search"
                    value={searchTerm}
                    isFocused
                    onInputChange={onSearchInput}
                >
                    <strong>Search: </strong>
                </InputWithLabel>

                <StyledButtonLarge type="submit" disabled={!searchTerm}>
                    {/* Submit */}
                    <Search height="16px" width="16px" />
                </StyledButtonLarge>
            </StyledSearchForm>
        )
);

const InputWithLabel = ({
    id,
    value,
    type = 'text',
    onInputChange,
    isFocused,
    children,
}) => {
    const inputRef = React.useRef();

    React.useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <>
            {/* <label htmlFor={id} className={styles.label}>
                {children}
            </label>
            &nbsp;
            <input
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                autoFocus={isFocused}
                onChange={onInputChange}
                className={styles.input}
            /> */}
            <StyledLabel htmlFor={id}>{children}</StyledLabel>
            &nbsp;
            <StyledInput
                ref={inputRef}
                id={id}
                type={type}
                value={value}
                autoFocus={isFocused}
                onChange={onInputChange}
            ></StyledInput>
        </>
    );
};

const List = React.memo(
    ({ list, onRemoveItem }) =>
        console.log('B:List') ||
        list.map((item) => (
            <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
        ))
);

const Item = React.memo(
    ({ item, onRemoveItem }) =>
        console.log('Item') || (
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
                    </button>
                </span>
            </div>
        )
);
// <StyledItem>
//     <StyledColumn width="40%">
//         <a href={item.url}>{item.title}</a>
//     </StyledColumn>
//     <StyledColumn width="30%">{item.author}</StyledColumn>
//     <StyledColumn width="10%">{item.num_comments}</StyledColumn>
//     <StyledColumn width="10%">{item.points}</StyledColumn>
//     <StyledColumn width="10%">
//         <StyledButtonSmall type="button" onClick={() => onRemoveItem(item)}>
//             Dismiss
//         </StyledButtonSmall>
//     </StyledColumn>
// </StyledItem>

export default App;
