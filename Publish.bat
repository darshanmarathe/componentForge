call git add .
call git commit -m %1
call git push
call npm run build
call git add .
call git commit -m %2
call git tag v%2
call git push
call status
pause
npm publish
