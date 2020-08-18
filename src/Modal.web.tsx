// TODO: Remove this abstraction and go back to React Native Web if one of these PR's is merged
// https://github.com/necolas/react-native-web/pull/1698 (this code)
// https://github.com/necolas/react-native-web/pull/1646 (this is the one that is getting merged in the future)
import * as React from 'react'
import ReactDOM from 'react-dom'

import { StyleSheet, View } from 'react-native'

const modalContext = createModalContext()

const animationDurationMs = 300

export default function Modal({
  children,
  animationType = 'none',
  visible,
  onRequestClose,
}: any) {
  const [internalVisible, setInternalVisible] = React.useState<boolean>(visible)
  const shouldDelayingUnmounting = !visible && animationType !== 'none'
  const animatedRef = React.useRef<any | null>(null)
  const modalRef = React.useRef<any | null>(null)
  const [delayUnmounting, setDelayUnmounting] = React.useState<boolean>(false)
  const open = visible || delayUnmounting || internalVisible
  const isCurrentModal = modalContext.use(open)

  // show fade out / slide out animation and prevent direct mount / unmount with the internal visibility
  React.useEffect(() => {
    if (internalVisible !== visible) {
      // hide modal
      if (!visible) {
        // if the modal is animated we should prevent direct unmount of the modal
        if (shouldDelayingUnmounting) {
          setDelayUnmounting(true)
        }
      }
      setInternalVisible(visible)
    }
  }, [
    shouldDelayingUnmounting,
    internalVisible,
    setInternalVisible,
    setDelayUnmounting,
    visible,
  ])

  // TODO: replace this with onTransitionEnd listener in React?
  // Ask Necolas if this is possible
  React.useEffect(() => {
    const ar = animatedRef.current
    if (ar) {
      const onEnd = () => {
        if (open) {
          setDelayUnmounting(false)
        }
      }
      ar.addEventListener('transitionend', onEnd)
      return () => ar.removeEventListener('transitionend', onEnd)
    }
  }, [open])

  const getFocusableNodes = React.useCallback<() => HTMLDivElement[]>(
    () =>
      modalRef.current
        ? Array.from(modalRef.current.querySelectorAll('[data-focusable=true]'))
        : [],
    [modalRef]
  )

  const onTabPress = React.useCallback(
    (event: KeyboardEvent) => {
      let focusableNodes = getFocusableNodes()

      // nothing to focus on
      if (focusableNodes.length === 0) {
        return
      }

      // filter out hidden nodes
      focusableNodes = focusableNodes.filter((node: any) => {
        return node.offsetParent !== null
      })

      // focus on the right elements when user clicks tab
      if (
        modalRef.current &&
        !modalRef.current.contains(document.activeElement)
      ) {
        focusableNodes[0].focus()
      } else {
        const focusedItemIndex = focusableNodes.indexOf(
          document.activeElement as HTMLDivElement
        )

        if (event.shiftKey && focusedItemIndex === 0) {
          focusableNodes[focusableNodes.length - 1].focus()
          event.preventDefault()
        }

        if (
          !event.shiftKey &&
          focusableNodes.length > 0 &&
          focusedItemIndex === focusableNodes.length - 1
        ) {
          focusableNodes[0].focus()
          event.preventDefault()
        }
      }
    },
    [getFocusableNodes]
  )

  const onKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onRequestClose()
      }
      if (event.key === 'Tab') {
        onTabPress(event)
      }
    },
    [onRequestClose, onTabPress]
  )

  React.useEffect(() => {
    if (visible && isCurrentModal) {
      document.addEventListener('keydown', onKeyDown)
      return () => document.removeEventListener('keydown', onKeyDown)
    }
  }, [isCurrentModal, onKeyDown, visible])
  const animationStyles = getAnimationStyles(visible)
  // @ts-ignore
  const animationStyle = animationStyles[animationType] || animationStyles.none
  // @ts-ignore
  return open
    ? ReactDOM.createPortal(
        <View
          ref={modalRef}
          //@ts-ignore
          accessibilityRole={'dialog'}
          aria-hidden={!open || !isCurrentModal}
          aria-modal={true}
          style={[StyleSheet.absoluteFill, styles.dialog]}
        >
          <View
            ref={animatedRef}
            style={[
              styles.animated,
              animationStyle,
              //@ts-ignore
              startAnimation[animationType] || null,
            ]}
          >
            {open ? children : null}
          </View>
        </View>,
        document.body
      )
    : null
}

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',

    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  animated: {
    height: '100%',
    //@ts-ignore
    transitionDuration: `${animationDurationMs}ms`,
    transitionTimingFunction: 'linear',
    overflow: 'hidden',
  },
  none: {},
  fadeIn: {
    //@ts-ignore
    animationKeyframes: [{ '0%': { opacity: 0 }, '100%': { opacity: 1 } }],
    animationDelay: 0,
    animationDuration: `${animationDurationMs}ms`,
    animationTimingFunction: 'linear',
  },
  slideIn: {
    //@ts-ignore
    animationKeyframes: [
      {
        '0%': {
          transform: [
            {
              translateY: '100%',
            },
          ],
        },
        '100%': {
          transform: [
            {
              translateY: 0,
            },
          ],
        },
      },
    ],
    animationDelay: 0,
    animationDuration: `${animationDurationMs}ms`,
    animationTimingFunction: 'linear',
  },
})

const startAnimation = {
  fade: styles.fadeIn,
  slide: styles.slideIn,
}

type Subscriber = {
  modalIndex: number
  setCurrentModal: (b: boolean) => any
}
const getAnimationStyles = (visible: boolean) => ({
  none: {},
  slide: {
    transform: [
      {
        translateY: visible ? 0 : '100%',
      },
    ],
  },
  fade: {
    opacity: visible ? 1 : 0,
  },
})

function createModalContext() {
  // subscribers with callbacks for external updates
  let subscribers: Subscriber[] = []
  let counter = 0
  let hiddenElements: any = []

  const allModalsAreClosed = () => {
    hiddenElements.forEach((element: any) => {
      element.setAttribute('aria-hidden', 'false')
    })
    hiddenElements = []
  }
  const firstModalIsOpened = () => {
    // hide all root elements on page for screen readers (except dialogs since these are handled internally and already
    // hidden elements)
    hiddenElements = document.querySelectorAll(
      'body > div:not([aria-role=dialog]):not([aria-hidden=true])'
    )
    hiddenElements.forEach((element: any) => {
      element.setAttribute('aria-hidden', 'true')
    })
  }

  const show = (setCurrentModal: (b: boolean) => any): number => {
    counter++

    if (subscribers.length === 0) {
      firstModalIsOpened()
    }

    // onFocus all other modals
    subscribers.forEach((s) => s.setCurrentModal(false))

    // focus current modal
    setCurrentModal(true)

    // add to subscribers so we can focus or blur them based on other modals on screen
    subscribers.push({ modalIndex: counter, setCurrentModal })
    return counter
  }

  const remove = (idx: number) => {
    subscribers = subscribers.filter((s) => s.modalIndex !== idx)

    if (subscribers.length > 0) {
      // focus modal below the closed one
      const subscriberToFocus = subscribers[subscribers.length - 1]
      subscriberToFocus.setCurrentModal(true)
    } else {
      allModalsAreClosed()
    }
  }

  const use = (visible: boolean) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentModal, setCurrentModal] = React.useState<boolean>(visible)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (visible) {
        let modalIndex = show(setCurrentModal)
        return () => remove(modalIndex)
      }
    }, [visible])

    return currentModal
  }

  return {
    use,
  }
}
