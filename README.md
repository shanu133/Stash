
  # Music App

  This is a code bundle for Music App. The original project is available at https://www.figma.com/design/Md0etimDgjrDPm48KBnvlB/Music-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Web Share Target Testing

  1. Deploy the app behind HTTPS (Vercel/Netlify) so Android recognizes the manifest and service worker.
  2. Visit the deployed URL in Chrome for Android and use the browser menu to install the PWA to your home screen.
  3. Share a link from another app (e.g., Instagram → Share → Stash). Android will launch Stash with the shared URL in the query string.
  4. The debug badge at the top-left of the screen will display the received payload. Once authentication completes, the app automatically triggers the normal `startProcessing` flow.
  5. After validating, you can hide or remove the debug badge by deleting the `#debug-console` element from `index.html` and the related code in `App.tsx`.
  