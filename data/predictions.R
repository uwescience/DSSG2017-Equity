###requires SEM_all.R to work!!

#clear columns that have no value to prediction
trash <- which(colnames(total) == "gis_id" | colnames(total) == "x1" | colnames(total) == "block_group")
new_total <- total[,-trash]


#function to actually access predictions
#takes the data you want, the new value to be inserted, the variable which it will be, and the model object to predict with
#returns predictions
prediction.creator <- function(data, change, var, model){
  col = which(colnames(data)==var) #column to change
  predictions = data.frame(matrix(nrow = 482, ncol = 8)) #create empty prediction data frame
  names(predictions) <- c("socio_status", "fam_friendlnss", "infrastructure",
                          "conn", "elem","upper", "health", "dev") #hard-coded names for themes
  
  #iterate through dataset row by row, predicting just for the one change in that block group
  #newdata needs to be scaled because model scales the data
  for(i in 1:482){
    new.data <- data
    new.vals <- change #change values
    new.data[i,col] <- new.vals #reinsert values
    temp <- lavPredict(model, type = "lv", newdata = scale(new.data)) #predict
    predictions[i,] <- temp[i,]
  }
  return(predictions)
}


#function to simplify the prediction creation process; merely feed it the variable you wish to change
#this simplicity required hardcoded decisions and will need to be changed for the future
#hard-codes the 5 levels to the minimum of all block groups, half the median, the median, double the median and the max of the whole set
final.preds.fun <- function(variable){
  col<- which(names(new_total)==variable)
  set = median(new_total[,col])
  set.max = max(new_total[,col])
  set.min = min(new_total[,col])
  
  new.set <- c(set.min, set*.5, set, set*2, set.max)
  
  #dummy frames for insertion
  preds.min <- data.frame(1:300, 1:300, 1:300)
  preds.low <- data.frame(1:300, 1:300, 1:300)
  preds.med <- data.frame(1:300, 1:300, 1:300)
  preds.high <- data.frame(1:300, 1:300, 1:300)
  preds.max <- data.frame(1:300, 1:300, 1:300)
  
  
  #iterate through changes to be done
  for(i in new.set){
      preds <- prediction.creator(data = new_total, change = i, var = variable, model = fit)
      preds$gis <- total$gis_id
      
      #fill correct dataframe and extract from the function
      if(i == new.set[1]){
        preds.min = preds
        preds.min$indicator = c(rep(1, 482))
      } else if(i == new.set[2]){
        preds.low = preds
        preds.low$indicator = c(rep(2, 482))
      } else if(i == new.set[3]){
        preds.med = preds
        preds.med$indicator = c(rep(3, 482))
      } else if(i == new.set[4]){
        preds.high = preds
        preds.high$indicator = c(rep(4, 482))
      } else {
        preds.max = preds
        preds.max$indicator = c(rep(5, 482))
      } 
  }
  

  temp <- rbind(preds.min, preds.low, preds.med, preds.high, preds.max)
  
  #write to a csv
  write.csv(temp, paste0("predictions_", variable,".csv"))

}



#the next lines of code until 102 are to attach block group to the created data sets; process was done after, hence the sloppiness
home <- read.csv("predictions_median_house_value.csv")
unit <- read.csv("predictions_occupied_housing_units.csv")
transit <- read.csv("predictions_avg_transit_time.csv")
fam <- read.csv("predictions_fam_upper.csv")

translation <- read.csv("Housing_indicators.csv")
block_group <- translation$block_group
block_group <- rep(block_group,5)

home <- cbind(block_group, home)
unit <- cbind(block_group, unit)
transit <- cbind(block_group, transit)
fam <- cbind(block_group, fam)

write.csv(home, "predictions_median_home_value.csv")
write.csv(unit, "predictions_occupied_housing_units.csv")
write.csv(transit, "predictions_avg_transit_time.csv")
write.csv(fam, "predictions_fam_upper.csv")

