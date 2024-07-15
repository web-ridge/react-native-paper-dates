"use strict";(self.webpackChunkreact_native_paper_dates_docusaurus=self.webpackChunkreact_native_paper_dates_docusaurus||[]).push([[753],{8183:(e,n,s)=>{s.r(n),s.d(n,{assets:()=>a,contentTitle:()=>o,default:()=>p,frontMatter:()=>r,metadata:()=>c,toc:()=>l});var t=s(4848),i=s(8453);const r={sidebar_position:1},o="Time Picker",c={id:"time-picker",title:"Time Picker",description:"The time picker provides a modal allowing the selection or input of a time.",source:"@site/docs/time-picker.md",sourceDirName:".",slug:"/time-picker",permalink:"/react-native-paper-dates/docs/time-picker",draft:!1,unlisted:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",previous:{title:"Introduction",permalink:"/react-native-paper-dates/docs/intro"},next:{title:"Date Picker",permalink:"/react-native-paper-dates/docs/category/date-picker"}},a={},l=[{value:"Usage",id:"usage",level:2},{value:"Live Example",id:"live-example",level:2},{value:"Props",id:"props",level:2}];function d(e){const n={a:"a",br:"br",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",strong:"strong",...(0,i.R)(),...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.h1,{id:"time-picker",children:"Time Picker"}),"\n",(0,t.jsx)(n.p,{children:"The time picker provides a modal allowing the selection or input of a time."}),"\n",(0,t.jsx)(n.h2,{id:"usage",children:"Usage"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-jsx",children:"import React from \"react\";\nimport { View, Text } from \"react-native\";\nimport { Button } from 'react-native-paper';\nimport { TimePickerModal } from 'react-native-paper-dates';\nimport { SafeAreaProvider } from \"react-native-safe-area-context\";\n\nexport default function App() {\n  const [visible, setVisible] = React.useState(false)\n  const onDismiss = React.useCallback(() => {\n    setVisible(false)\n  }, [setVisible])\n\n  const onConfirm = React.useCallback(\n    ({ hours, minutes }) => {\n      setVisible(false);\n      console.log({ hours, minutes });\n    },\n    [setVisible]\n  );\n\n  return (\n    <SafeAreaProvider>\n      <View style={{justifyContent: 'center', flex: 1, alignItems: 'center'}}>\n        <Button onPress={() => setVisible(true)} uppercase={false} mode=\"outlined\">\n          Pick time\n        </Button>\n        <TimePickerModal\n          visible={visible}\n          onDismiss={onDismiss}\n          onConfirm={onConfirm}\n          hours={12}\n          minutes={14}\n        />\n      </View>\n    </SafeAreaProvider>\n  );\n}\n"})}),"\n",(0,t.jsx)(n.h2,{id:"live-example",children:"Live Example"}),"\n",(0,t.jsxs)(n.p,{children:["View an interactive ",(0,t.jsx)(n.a,{href:"https://snack.expo.dev/@fitzwabs/react-native-paper-dates-time-picker",children:"Expo snack"}),"."]}),"\n",(0,t.jsx)(n.h2,{id:"props",children:"Props"}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"locale (Required)"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: String"}),(0,t.jsx)(n.br,{}),"\n","A locale can be composed of both a base language, the country (territory) of use, and possibly codeset (which is usually assumed). For example, German is de."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"visible (Required)"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: boolean"}),(0,t.jsx)(n.br,{}),"\n","Flag indicating if the component should be displayed."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"onDismiss (Required)"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: Function"}),(0,t.jsx)(n.br,{}),"\n","The action to take when the component is closed."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"onConfirm (Required)"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: Function"}),(0,t.jsx)(n.br,{}),"\n","The action to take when the date is selected."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"hours"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: number | undefined"}),(0,t.jsx)(n.br,{}),"\n","The hours values used to populate the component. Defaults to the current hour."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"minutes"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: number | undefined"}),(0,t.jsx)(n.br,{}),"\n","The minutes values used to populate the component. Defaults to the current minutes."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"label"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: String | undefined"}),(0,t.jsx)(n.br,{}),"\n","The label used as the header in the component. Defaults to ",(0,t.jsx)(n.code,{children:"'Select time'"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"uppercase"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: boolean | undefined"}),(0,t.jsx)(n.br,{}),"\n","Flag indicating if the text in the component should be uppercase. Defaults to ",(0,t.jsx)(n.code,{children:"true"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"cancelLabel"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: String | undefined"}),(0,t.jsx)(n.br,{}),"\n","The label that will close the component. Defaults to ",(0,t.jsx)(n.code,{children:"'Cancel'"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"confirmLabel"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: String | undefined"}),(0,t.jsx)(n.br,{}),"\n","The label that will confirm the component selection. Defaults to ",(0,t.jsx)(n.code,{children:"'Ok'"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"animationType"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: String | undefined"}),(0,t.jsx)(n.br,{}),"\n","The animation used when opening the component. Defaults to ",(0,t.jsx)(n.code,{children:"'slide'"})," on ios/android and ",(0,t.jsx)(n.code,{children:"'none'"})," on web."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"keyboardIcon"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: string | undefined"}),(0,t.jsx)(n.br,{}),"\n","The icon used to toggle between the OS input. Defaults to ",(0,t.jsx)(n.code,{children:"keyboard-outline"}),". You can pass the name of an icon from ",(0,t.jsx)(n.a,{href:"https://materialdesignicons.com/",children:"MaterialCommunityIcons"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"clockIcon"}),(0,t.jsx)(n.br,{}),"\n",(0,t.jsx)(n.code,{children:"Type: string | undefined"}),(0,t.jsx)(n.br,{}),"\n","The icon used to toggle between time picker and input. Defaults to ",(0,t.jsx)(n.code,{children:"clock-outline"}),". You can pass the name of an icon from ",(0,t.jsx)(n.a,{href:"https://materialdesignicons.com/",children:"MaterialCommunityIcons"}),"."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"use24HourClock"}),"\n",(0,t.jsx)(n.code,{children:"Type: boolean | undefined"}),"\nFlag indicating if the time input should use the 24 hours clock. Defaults to the system clock."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"inputFontSize"}),"\n",(0,t.jsx)(n.code,{children:"Type: number | undefined"}),"\nFont size of the time input. Defaults to 57. Useful when using a custom font."]}),"\n",(0,t.jsxs)(n.p,{children:[(0,t.jsx)(n.strong,{children:"defaultInputType"}),"\n",(0,t.jsx)(n.code,{children:"Type: 'picker' | 'keyboard'"}),"\nWhich input type to use by default. Defaults to the clock-face picker."]})]})}function p(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(d,{...e})}):d(e)}},8453:(e,n,s)=>{s.d(n,{R:()=>o,x:()=>c});var t=s(6540);const i={},r=t.createContext(i);function o(e){const n=t.useContext(r);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function c(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:o(e.components),t.createElement(r.Provider,{value:n},e.children)}}}]);