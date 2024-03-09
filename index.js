import PocketBase from 'pocketbase'
import EventSource from 'eventsource'
import distance from '@turf/distance'
global.EventSource = EventSource

export const pb = new PocketBase('https://dotyeison.paoloose.site');

await pb.admins.authWithPassword('backend@dotyeison.com', '92429d82a41e930486c6de5ebda9602d55c39986')

const devices = await pb.collection('devices').getFullList()

pb.collection('reports').subscribe('*', e => {
  if (e.action === 'create') {
    const report = e.record
    const eventName = report.expand.event_type.name
    const to = { lat: report.lat, lon: report.lon }
    devices.forEach(async device => {
      if (device.expoPushToken.startsWith('ExponentPushToken')) {
        const from = { lat: device.lat, lon: device.lon }
        const distance = distanceBetweenCoordinates(from, to)

        if (distance < 1000) {
          const formattedDistance = formatDistanceAsText(distance)
          const message = {
            to: device.expoPushToken,
            sound: 'default',
            title: `${eventName} a ${formattedDistance}`,
            body: report.description,
          }
  
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          })
        }
    }})
  }
}, { expand: "event_type" })
.then(() => {
  console.log('Subscribed to reports');
})
.catch(console.error)

const distanceBetweenCoordinates = (from, to) => {
  const unroundedDistance = distance([from.lon, from.lat], [to.lon, to.lat], {
    units: 'meters',
  });
  return Math.round(unroundedDistance * 100) / 100;
}

const formatDistanceAsText = (meters) => {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};
