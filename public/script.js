function ResourceItem({ name, length }) {
  return `
    <li>
      <a href="${name}">/${name}</a>
      <sup>${length ? `${length}x` : 'object'}</sup>
    </li>
  `
}

function ResourceList({ endpoints }) {
  return `
    <ul>
      ${Object.keys(endpoints)
      .map(name =>
        ResourceItem({
          name,
          length: endpoints[name]
        })
      )
      .join('')}
    </ul>
  `
}

function NoResources() {
  return `<p>No resources found</p>`
}

function ResourcesBlock({ endpoints }) {
  return `
    <div>
      ${Object.keys(endpoints).length ? ResourceList({ endpoints }) : NoResources()}
    </div>
  `
}

window
  .fetch('endpoints')
  .then(response => response.json())
  .then(
    endpoints =>
      (document.getElementById('resources').innerHTML = ResourcesBlock({ endpoints }))
  )

function CustomRoutesBlock({ customRoutes }) {
  const rules = Object.keys(customRoutes)
  if (rules.length) {
    return `
      <div>
        <h1>Custom Routes</h1>
        <table>
          ${rules
        .map(
          rule => `
            <tr>
              <td>${rule}</td>
              <td><code>⇢</code> ${customRoutes[rule]}</td>
            </tr>
          `
        )
        .join('')}
        </table>
      </div>
    `
  }
}

// window
//   .fetch('__rules')
//   .then(response => response.json())
//   .then(
//     customRoutes =>
//       (document.getElementById('custom-routes').innerHTML = CustomRoutesBlock({
//         customRoutes
//       }))
//   )
