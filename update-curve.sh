cd apps/main
yarn add @curvefi/api @curvefi/lending-api @curvefi/lending-api @curvefi/stablecoin-api
cd ../..
git add .
git commit -m "chore: update Curve API dependencies"
git push
gh pr create --title "chore: update Curve dependencies" --body "- Update Curve API dependencies"
