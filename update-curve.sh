cd apps/dao
yarn add @curvefi/api
cd ../../apps/lend
yarn add @curvefi/lending-api
cd ../../apps/loan
yarn add @curvefi/lending-api
yarn add @curvefi/stablecoin-api
cd ../../apps/main
yarn add @curvefi/api
cd ../..
git add .
git commit -m "chore: update Curve API dependencies"
git push
gh pr create --title "chore: update Curve dependencies" --body "- Update Curve API dependencies"
