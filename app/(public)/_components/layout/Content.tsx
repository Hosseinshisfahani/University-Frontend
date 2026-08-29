import React from "react"

export default function Content(
    {
        children,
        id
    }:{
        children: React.ReactNode
        id?: string
    }
){
    return (
        <section id={id} className="w-full max-w-7xl px-10 mx-auto xl:py-20 py-5">
            {children}
        </section>
    )
}