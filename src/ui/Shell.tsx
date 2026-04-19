import { Topbar } from './Topbar'

export function Shell() {
  return (
    <div className="flex h-screen w-screen flex-col bg-surface text-text">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <aside className="hairline-r flex w-[380px] min-w-[340px] flex-col bg-elev-1">
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-subtle text-sm">chat pane</p>
          </div>
        </aside>
        <main className="relative flex min-w-0 flex-1 flex-col bg-surface grain">
          <div className="flex flex-1 items-center justify-center p-8">
            <p className="text-subtle text-sm">workspace</p>
          </div>
        </main>
      </div>
    </div>
  )
}
