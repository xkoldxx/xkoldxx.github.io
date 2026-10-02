// ponytail: northernedgeit.tech (+www) is a spare domain; send it to the canonical site.
export const onRequest = ({ request, next }) => {
  const url = new URL(request.url);
  if (!url.hostname.endsWith('northernedgeit.tech')) return next();
  return Response.redirect(`https://www.neit.tech${url.pathname}${url.search}`, 301);
};
