import { buddies, shopItems } from '../data'
import { ALL_ACTIONS } from '../components/BuddyArt'
import { BuddyArt } from '../components/BuddyArt'

/** หน้ารวมท่าทางและของแต่งตัวของผู้ช่วยทุกตัว (เปิดเฉพาะตอนพัฒนา: http://localhost:5173/#gallery) */
export function BuddyGallery() {
  return (
    <div className="space-y-8 p-4">
      <section>
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
      </section>
      <section>
        <h2 className="text-2xl font-bold">ของแต่งตัว</h2>
        <table className="mt-4 text-center text-xs">
          <thead>
            <tr>
              <th />
              {shopItems.map((i) => (
                <th key={i.id} className="px-1">{i.name}</th>
              ))}
              <th>ใส่ครบ</th>
            </tr>
          </thead>
          <tbody>
            {buddies.map((b) => (
              <tr key={b.id}>
                <th className="pr-2">{b.id}</th>
                {shopItems.map((i) => (
                  <td key={i.id}>
                    <BuddyArt buddy={b} outfit={{ [i.slot]: i.id }} className="size-20" />
                  </td>
                ))}
                <td>
                  <BuddyArt buddy={b} action="cheer" outfit={{ head: 'crown', face: 'round-glasses', neck: 'scarf' }} className="size-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
