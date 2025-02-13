import { createSvgIcon } from '@mui/material/utils'

export const HeartIcon = createSvgIcon(
  <svg viewBox="0 0 25 22" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <path
      d="M21.5348 10.5349L12 20.0712L2.46521 10.535C2.4652 10.535 2.46518 10.535 2.46516 10.5349C1.52784 9.59731 1.00128 8.3258 1.00128 7C1.00128 5.67428 1.52778 4.40283 2.465 3.46521C2.46504 3.46518 2.46507 3.46514 2.46511 3.46511C2.46514 3.46507 2.46518 3.46503 2.46521 3.465C3.40283 2.52778 4.67428 2.00128 6 2.00128C7.32582 2.00128 8.59736 2.52786 9.535 3.46521L9.53519 3.46541L11.2932 5.22191L12 5.92811L12.7068 5.22191L14.4648 3.46541L14.4711 3.45911L14.4773 3.45271C14.9385 2.97516 15.4902 2.59425 16.1003 2.3322C16.7103 2.07016 17.3664 1.93223 18.0303 1.92646C18.6942 1.92069 19.3526 2.0472 19.9671 2.2986C20.5815 2.55001 21.1398 2.92127 21.6093 3.39074C22.0787 3.8602 22.45 4.41846 22.7014 5.03294C22.9528 5.64742 23.0793 6.30582 23.0735 6.96972C23.0678 7.63361 22.9298 8.28972 22.6678 8.89974C22.4057 9.50975 22.0248 10.0615 21.5473 10.5227L21.541 10.5288L21.5348 10.5349Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>,
  'Heart',
)

export const FavoriteHeartIcon = ({ isFavorite, color = 'primary' }: { isFavorite: boolean; color?: string }) => (
  <HeartIcon
    htmlColor={color}
    sx={{ fill: isFavorite ? color : 'transparent' }}
    data-testid={'favorite-icon' + (isFavorite ? '-filled' : '')}
  />
)
