import React from 'react';

type LastSearchesProps = {
    lastSearches: string[];
    onLastSearch: (searchTerm: string) => void;
};

const LastSearches = ({ lastSearches, onLastSearch }: LastSearchesProps) => (
    <div
        style={{
            display: 'flex',
            padding: 'padding: 50px 50px 50px 0px',
        }}
    >
        {lastSearches.map((searchTerm: string, index: number) => (
            <button
                style={{ width: '20%' }}
                key={searchTerm + index}
                type="button"
                onClick={() => {
                    onLastSearch(searchTerm);
                }}
            >
                {searchTerm}
            </button>
        ))}
    </div>
);

export default LastSearches;
