import type { DetailedHTMLProps, FC, ImgHTMLAttributes } from 'react'
import logoUrl from './logo.png'

export type LogoProps = Omit<DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>, 'src' | 'alt'>

const Logo: FC<LogoProps> = props => {
  return <img src={logoUrl} alt="logo" {...props} />
}

export default Logo
