 FROM node:slim

WORKDIR /Web

COPY ./web .

EXPOSE 80

RUN echo 'hello world'

RUN npm install 

CMD ["npm" , "run" , "start"]