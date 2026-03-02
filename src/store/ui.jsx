
import { createContext, useContext, useMemo, useState } from 'react'
const Ctx = createContext(null)
export function UIProvider({children}){
  const [lang,setLang]=useState(localStorage.getItem('ui-lang')||'en')
  const [sidebarOpen,setSidebarOpen]=useState(true)
  const value=useMemo(()=>({lang,setLang:(v)=>{localStorage.setItem('ui-lang',v);setLang(v)},sidebarOpen,setSidebarOpen}),[lang,sidebarOpen])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useUI = ()=> useContext(Ctx)
