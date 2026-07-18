import './index.css'
import './home.css'

import { HomeFooter } from '@rspress/core/theme-original'
import { HomeLanding } from '../components/HomeLanding'

export function HomeLayout() {
  return (
    <>
      <HomeLanding />
      <HomeFooter />
    </>
  )
}

export * from '@rspress/core/theme-original'
