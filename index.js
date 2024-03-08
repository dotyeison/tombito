import PocketBase from 'pocketbase'
import EventSource from 'eventsource'
global.EventSource = EventSource

export const pb = new PocketBase('https://dotyeison.paoloose.site');

pb.collection('reports').subscribe('*', e => {
  if (e.action === 'create') {

  }
})
.then(() => {
  console.log('Subscribed to reports');
})
.catch(console.error)