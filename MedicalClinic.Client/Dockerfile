# Stage 1: Build Angular application
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration development

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/MedicalClinic.Client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
