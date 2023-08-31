### require
- WSL2 or macOS
- VSCode
- node, docker, mycli

### npm
```bash
npm ci
npx eslint --init
```

### db setup
```bash
# for m1 mac
sudo docker compose -f docker-compose.mysql10-14.m1mac.yml up -d;

# for wsl2
sudo service docker start;
sudo docker compose -f docker-compose.mysql10-14.yml up -d;

# create tables, data
## note1 ... :s/`tastylog`/tastylog;/
## note2 ... encode to utf-8 (default utf-8 with BOM)
mycli -uroot -h localhost -P 9999 -proot < ddl.sql

mycli -uroot -h localhost -P 9999 -proot < m_address.sql
mycli -uroot -h localhost -P 9999 -proot < m_category.sql
mycli -uroot -h localhost -P 9999 -proot < t_user.sql
mycli -uroot -h localhost -P 9999 -proot < t_shop.sql
mycli -uroot -h localhost -P 9999 -proot < t_review.sql
mycli -uroot -h localhost -P 9999 -proot < t_shop_category.sql
```
