CREATE TABLE nfts_cache (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image VARCHAR(512),
    txhash VARCHAR(128),
    rarity VARCHAR(50),
    type VARCHAR(50),
    status SMALLINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    locked_at TIMESTAMP
);

CREATE TABLE users (
    address VARCHAR(128) PRIMARY KEY,
    currentkeys INTEGER,
    pity_current INTEGER,
    pity_guaranteedEpic INTEGER,
    pity_guaranteedLegendary INTEGER
);

CREATE TABLE user_history (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(128),
    name VARCHAR(255),
    type VARCHAR(50),
    rarity VARCHAR(50),
    date TIMESTAMP,
    FOREIGN KEY (user_address) REFERENCES users(address)
);

