import { withBase } from '@rspress/core/runtime'

import AppStoreIcon from './icons/AppStoreIcon'
import GithubIcon from './icons/GithubIcon'
import GooglePlayIcon from './icons/GooglePlayIcon'

type Data = {
  android?: string
  description: string
  github?: string
  icon: string
  ios?: string
  name: string
}

const data: Data[] = [
  {
    android:
      'https://play.google.com/store/apps/details?id=com.bitzllc.bluebird',
    description: 'Lease land for outdoor activities',
    icon: '/showcase/bluebirding-icon.jpg',
    ios: 'https://apps.apple.com/us/app/bluebirding/id1553837668',
    name: 'Bluebirding',
  },
]

export default function Showcase() {
  return (
    <div className="showcase-list">
      {data.map((item) => (
        <article className="showcase-app" key={item.name}>
          <div className="showcase-app__header">
            <img
              alt=""
              className="showcase-app__icon"
              height={56}
              src={withBase(item.icon)}
              width={56}
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
                rel="noopener noreferrer"
                target="_blank"
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
                rel="noopener noreferrer"
                target="_blank"
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
                rel="noopener noreferrer"
                target="_blank"
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
