import { withBase } from '@rspress/core/runtime'

import AppStoreIcon from './icons/AppStoreIcon'
import GithubIcon from './icons/GithubIcon'
import GooglePlayIcon from './icons/GooglePlayIcon'

type Data = {
  name: string
  description: string
  icon: string
  android?: string
  ios?: string
  github?: string
}

const data: Data[] = [
  {
    name: 'Bluebirding',
    description: 'Lease land for outdoor activities',
    icon: '/showcase/bluebirding-icon.jpg',
    android:
      'https://play.google.com/store/apps/details?id=com.bitzllc.bluebird',
    ios: 'https://apps.apple.com/us/app/bluebirding/id1553837668',
  },
]

export default function Showcase() {
  return (
    <div className="showcase-list">
      {data.map((item) => (
        <article key={item.name} className="showcase-app">
          <div className="showcase-app__header">
            <img
              className="showcase-app__icon"
              src={withBase(item.icon)}
              alt=""
              width={56}
              height={56}
            />
            <div className="showcase-app__meta">
              <h3 className="showcase-app__name">{item.name}</h3>
              <p className="showcase-app__description">{item.description}</p>
            </div>
          </div>
          <div className="showcase-app__stores">
            {item.ios ? (
              <a
                className="showcase-store-btn"
                href={item.ios}
                target="_blank"
                rel="noopener noreferrer"
              >
                <AppStoreIcon color="currentColor" />
                <span>
                  <span className="showcase-store-btn__label">
                    Download on the
                  </span>
                  <span className="showcase-store-btn__store">App Store</span>
                </span>
              </a>
            ) : null}
            {item.android ? (
              <a
                className="showcase-store-btn"
                href={item.android}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GooglePlayIcon color="currentColor" />
                <span>
                  <span className="showcase-store-btn__label">Get it on</span>
                  <span className="showcase-store-btn__store">Google Play</span>
                </span>
              </a>
            ) : null}
            {item.github ? (
              <a
                className="showcase-store-btn showcase-store-btn--ghost"
                href={item.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon color="currentColor" />
                <span>
                  <span className="showcase-store-btn__label">View on</span>
                  <span className="showcase-store-btn__store">GitHub</span>
                </span>
              </a>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
