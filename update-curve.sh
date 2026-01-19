cd apps/main
yarn upgrade @curvefi/api @curvefi/llamalend-api
cd ../..
git add .
git commit -m "chore: update Curve API dependencies"
git push
gh pr create --title "chore: update Curve dependencies" --body "- Update Curve API dependencies"
