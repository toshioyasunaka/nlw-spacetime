import { ReactNode } from 'react'
import './globals.css'

// Importação de fontes pelo Next.js
import {
  Roboto_Flex as Roboto,
  Bai_Jamjuree as BaiJamjuree,
} from 'next/font/google'

const roboto = Roboto({ subsets: ['latin'], variable: '--font-roboto' }) // por ser uma fonte "_Flex", o  tamanho vai se adaptar conforme nossa necessidade
const baiJamjuree = BaiJamjuree({
  subsets: ['latin'],
  weight: '700',
  variable: '--font-bai-jamjuree',
}) // aqui devemos importar o "weight", já que não é uma fonte "_Flex"
// O "registro" das fontes é feito no arquivo "tailwind.config.js", assim é possível usar sua classe como se fosse uma class Tailwind.

export const metadata = {
  title: 'NLW Spacetime',
  description:
    'Uma cápsula do tempo construída com React,. Next.js, TailwindCSS e Typescript.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${baiJamjuree.variable} bg-gray-900 font-sans text-gray-100`}
      >
        {children}
      </body>
    </html>
  )
}
