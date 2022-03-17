import React from 'react';
import styles from './App.module.css';
import cs from 'classnames'; /* A simple javascript utility for conditionally joining classNames together */
import { ReactComponent as Search } from './search-solid.svg';
import InputWithLabel from './InputWithLabel';

type SearchFormProps = {
    searchTerm: string;
    onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const SearchForm = ({
    searchTerm,
    onSearchInput,
    onSearchSubmit,
}: SearchFormProps) => (
    <form onSubmit={onSearchSubmit} className={styles.searchForm}>
        <InputWithLabel
            id="search"
            value={searchTerm}
            isFocused
            onInputChange={onSearchInput}
        >
            <strong>Search: </strong>
        </InputWithLabel>
        <button
            type="submit"
            disabled={!searchTerm}
            className={cs(styles.button, styles.buttonLarge)}
            // className={cs(styles.button, { [styles.buttonLarge]: true })}    alternative
        >
            <Search height="16px" width="16px" />
            Submit
        </button>
    </form>
);

export default SearchForm;
