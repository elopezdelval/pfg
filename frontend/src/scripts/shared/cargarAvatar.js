export default function urlAvatar(id) {
    return fetch(`/api/auth/urlAvatar?id=${id}`)
    .then(res => {
      if (!res.ok) {
        throw new Error("error al cargar los avatares");
      }
      return res.json();
    })
    .catch(err => {
        console.log(err);
    })
}