import React, { FC, useMemo, ReactNode } from 'react';

import {
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import Image from 'next/image'
import styles from '../styles/AppBar.module.css'
require('@solana/wallet-adapter-react-ui/styles.css');

export const AppBar: FC = () => {
    return (
        <nav className={styles.NavBar}>
            <Image src="/solanaLogoMark.svg" alt="solana logo" height={30} width={30} />
            <p className={styles.paragraph}>Transfer SOL</p>
            <WalletMultiButton />
        </nav>
    )
}
