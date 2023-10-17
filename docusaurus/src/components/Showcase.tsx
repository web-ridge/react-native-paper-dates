import React from 'react';

import color from 'color';

import AppStoreIcon from './AppStoreIcon';
import GithubIcon from './GithubIcon';
import GooglePlayIcon from './GooglePlayIcon';

type Data = {
  color: string;
  name: string;
  image: string;
  android?: string;
  ios?: string;
  github?: string;
};

const data: Data[] = [
  {
    color: '#2979FF',
    name: 'Bluebirding',
    image: '/react-native-paper-dates/showcase/bluebirding.png',
    android:
      'https://play.google.com/store/apps/details?id=com.bitzllc.bluebird',
    ios: 'https://apps.apple.com/us/app/bluebirding/id1553837668',
  },
];

const getOpacity = (item?: string) => (item ? 1 : 0.4);

export default function Showcase() {
  return (
    <div className="showcase-gallery">
      {data.map((item) => {
        const tintColor = color(item.color).isLight() ? '#000000' : '#FFFFFF';
        return (
          <div key={item.image}>
            <div className="showcase-image-container">
              <img className="showcase-image" src={item.image} alt="" />
              <div
                className="showcase-info"
                style={{ backgroundColor: item.color }}
              >
                <h3
                  className="showcase-app-name"
                  style={{
                    color: tintColor,
                  }}
                >
                  {item.name}
                </h3>
                <div className="showcase-badge-container">
                  <a
                    href={item.android}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ opacity: getOpacity(item.android) }}
                  >
                    <GooglePlayIcon color={tintColor} />
                  </a>
                  <div className="showcase-separation" />
                  <a
                    href={item.ios}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ opacity: getOpacity(item.ios) }}
                  >
                    <AppStoreIcon color={tintColor} />
                  </a>
                  <div className="showcase-separation" />
                  <a
                    href={item.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ opacity: getOpacity(item.github) }}
                  >
                    <GithubIcon color={tintColor} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}