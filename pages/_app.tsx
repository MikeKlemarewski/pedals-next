import 'styles/globals.css'
import { Roboto_Flex } from '@next/font/google'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { CssBaseline } from '@mui/material'
import Navigation from 'components/navigation'

const roboto = Roboto_Flex({ subsets: ['latin'] })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>
        {`
          html {
            font-family: ${roboto.style.fontFamily};
          }
        `}
      </style>

      <Head>
        <title>Pedals!</title>
        <meta name="description" content="Build the pedal board of your dreams!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <CssBaseline />

      <Navigation>
        <Component {...pageProps} />
      </Navigation>
    </>
  )
}
