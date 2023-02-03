import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
    return (
        <>
            <Head>
                <title>Moladin Financing Engineer Productivity Booster</title>
                <meta name="description" content="Generating base script to boost engineer productivity" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <div className={styles.center}>
                    <Image
                        className={styles.logo}
                        src="/next.svg"
                        alt="Next.js Logo"
                        width={180}
                        height={37}
                        priority
                    />
                    <div className={styles.logo} style={{margin: 'auto 35px'}}>
                        <Image
                            src="/icon-plus.png"
                            alt="13"
                            width={37}
                            height={37}
                            priority
                        />
                    </div>
                    <div className={styles.logo}>
                        <Image
                            src="/openai.png"
                            alt="13"
                            width={150}
                            height={37}
                            priority
                        />
                    </div>
                </div>

                <div className={styles.grid}>
                    <a
                        href="/code-review"
                        className={styles.card}
                    >
                        <h2 className={inter.className}>
                            Code review <span>-&gt;</span>
                        </h2>
                        <p className={inter.className}>
                            Get insight for your code
                        </p>
                    </a>

                    <a
                        href="/sql-review"
                        className={styles.card}
                    >
                        <h2 className={inter.className}>
                            SQL review <span>-&gt;</span>
                        </h2>
                        <p className={inter.className}>
                            Review your SQL here
                        </p>
                    </a>

                    <a
                        href="/unit-test"
                        className={styles.card}
                    >
                        <h2 className={inter.className}>
                            Unit test <span>-&gt;</span>
                        </h2>
                        <p className={inter.className}>
                            Initiate unit test for use case
                        </p>
                    </a>

                    <a
                        href="/automation-test"
                        className={styles.card}
                    >
                        <h2 className={inter.className}>
                            Automation test <span>-&gt;</span>
                        </h2>
                        <p className={inter.className}>
                            Instantly generate API automation test
                        </p>
                    </a>
                </div>
            </main>
        </>
    )
}
