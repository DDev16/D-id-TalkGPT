import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
  return <div className="bg-custom-image"><Component {...pageProps} /></div>
}

