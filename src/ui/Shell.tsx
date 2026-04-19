import { Topbar } from './Topbar'
import { ChatPane } from './ChatPane'
import { Workspace } from './Workspace'

export function Shell() {
  return (
    <div className="flex h-screen w-screen flex-col bg-surface text-text">
      <Topbar />
      <div className="flex min-h-0 flex-1">
        <aside className="hairline-r flex min-h-0 w-[380px] min-w-[340px] flex-col bg-elev-1">
          <ChatPane />
        </aside>
        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-surface grain">
          <Workspace />
        </main>
      </div>
    </div>
  )
}
