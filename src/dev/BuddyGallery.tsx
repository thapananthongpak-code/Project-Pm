import { buddies } from '../data'
import { ALL_ACTIONS } from '../components/BuddyArt'
import { BuddyArt } from '../components/BuddyArt'

/** หน้ารวมท่าทางของผู้ช่วยทุกตัว (เปิดเฉพาะตอนพัฒนา: http://localhost:5173/#gallery) */
export function BuddyGallery() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">ท่าทางผู้ช่วย</h1>
      <table className="mt-4 text-center text-xs">
        <thead>
          <tr>
            <th />
            {ALL_ACTIONS.map((a) => (
              <th key={a} className="px-1">{a}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buddies.map((b) => (
            <tr key={b.id}>
              <th className="pr-2">{b.id}</th>
              {ALL_ACTIONS.map((a) => (
                <td key={a}>
                  <BuddyArt buddy={b} action={a} className="size-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
